import Combine
import Foundation
import os.log

public final class NotesManager {
    public enum PrunePolicy: Equatable {
        case keepDays(Int)
        case never

        public var keepDays: Int? {
            switch self {
            case .keepDays(let value):
                return value
            case .never:
                return nil
            }
        }
    }

    public static let defaultDebounceInterval: TimeInterval = 0.5

    private let fileManager: FileManager
    private let baseURL: URL
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder
    private let queue = DispatchQueue(label: "com.daydrain.notes", qos: .userInitiated)
    private var cache: [String: DailyNote] = [:]
    private var pendingWorkItems: [String: DispatchWorkItem] = [:]
    private var observers: [NSObjectProtocol] = []
    private var prunePolicy: PrunePolicy

    private let activeNoteSubject: CurrentValueSubject<DailyNote, Never>
    private var activeDate: Date

    private lazy var isoFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(secondsFromGMT: 0)
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    public var activeNotePublisher: AnyPublisher<DailyNote, Never> {
        activeNoteSubject.eraseToAnyPublisher()
    }

    public init(
        fileManager: FileManager = .default,
        prunePolicy: PrunePolicy = .keepDays(30)
    ) {
        self.fileManager = fileManager
        self.prunePolicy = prunePolicy
        let supportURL = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first ?? URL(fileURLWithPath: NSTemporaryDirectory())
        self.baseURL = supportURL
            .appendingPathComponent("DayDrain", isDirectory: true)
            .appendingPathComponent("notes", isDirectory: true)

        self.encoder = JSONEncoder()
        self.decoder = JSONDecoder()
        encoder.dateEncodingStrategy = .iso8601
        decoder.dateDecodingStrategy = .iso8601

        let today = Date()
        self.activeDate = today

        if !fileManager.fileExists(atPath: baseURL.path) {
            try? fileManager.createDirectory(at: baseURL, withIntermediateDirectories: true)
        }

        let todayNote = Self.ensureNoteExists(for: today, cache: &cache, queue: queue, baseURL: baseURL, decoder: decoder, encoder: encoder, formatter: isoFormatter, fileManager: fileManager)
        self.activeNoteSubject = CurrentValueSubject(todayNote)

        observers.append(NotificationCenter.default.addObserver(forName: .NSCalendarDayChanged, object: nil, queue: nil) { [weak self] _ in
            self?.handleDayChange()
        })

        if case let .keepDays(days) = prunePolicy {
            pruneOldNotes(keepDays: days)
        }
    }

    deinit {
        observers.forEach { NotificationCenter.default.removeObserver($0) }
    }

    public func setActiveDate(_ date: Date) {
        activeDate = date
        let note = ensureNote(for: date)
        DispatchQueue.main.async {
            self.activeNoteSubject.send(note)
        }
    }

    public func note(for date: Date) -> DailyNote {
        ensureNote(for: date)
    }

    public func updateActiveNote(content: String) {
        updateNote(content: content, for: activeDate)
    }

    public func updateNote(content: String, for date: Date) {
        let dateString = isoString(from: date)
        queue.async { [weak self] in
            guard let self else { return }
            var note = self.cache[dateString] ?? DailyNote(date: dateString)
            note.content = content
            note.updatedAt = Date()
            self.cache[dateString] = note
            self.scheduleSave(note)
            if Calendar.current.isDate(date, inSameDayAs: self.activeDate) {
                DispatchQueue.main.async {
                    self.activeNoteSubject.send(note)
                }
            }
        }
    }

    public func activeNote() -> DailyNote {
        activeNoteSubject.value
    }

    public func pruneOldNotes(keepDays: Int) {
        guard keepDays > 0 else { return }
        let calendar = Calendar(identifier: .gregorian)
        let cutoff = calendar.startOfDay(for: calendar.date(byAdding: .day, value: -keepDays + 1, to: Date()) ?? Date())
        queue.async { [weak self] in
            guard let self else { return }
            guard let contents = try? self.fileManager.contentsOfDirectory(at: self.baseURL, includingPropertiesForKeys: nil) else { return }
            for url in contents {
                let dateString = url.deletingPathExtension().lastPathComponent
                guard let date = self.isoFormatter.date(from: dateString) else { continue }
                if date < cutoff {
                    try? self.fileManager.removeItem(at: url)
                    self.cache[dateString] = nil
                }
            }
        }
    }

    public func setPrunePolicy(_ policy: PrunePolicy) {
        prunePolicy = policy
        if case let .keepDays(days) = policy {
            pruneOldNotes(keepDays: days)
        }
    }

    private func ensureNote(for date: Date) -> DailyNote {
        let dateString = isoString(from: date)
        return queue.sync {
            if let cached = cache[dateString] {
                return cached
            }
            let note = Self.ensureNoteExists(for: date, cache: &cache, queue: queue, baseURL: baseURL, decoder: decoder, encoder: encoder, formatter: isoFormatter, fileManager: fileManager)
            return note
        }
    }

    private func scheduleSave(_ note: DailyNote) {
        let dateString = note.date
        pendingWorkItems[dateString]?.cancel()
        let workItem = DispatchWorkItem { [weak self] in
            self?.write(note)
        }
        pendingWorkItems[dateString] = workItem
        queue.asyncAfter(deadline: .now() + Self.defaultDebounceInterval, execute: workItem)
    }

    private func write(_ note: DailyNote) {
        let url = fileURL(for: note.date)
        do {
            let data = try encoder.encode(note)
            try data.write(to: url, options: [.atomic])
        } catch {
            os_log("Failed to write note %{public}@ - %{public}@", type: .error, note.date, error.localizedDescription)
        }
    }

    private func fileURL(for dateString: String) -> URL {
        baseURL.appendingPathComponent("\(dateString).json", isDirectory: false)
    }

    private func isoString(from date: Date) -> String {
        isoFormatter.string(from: date)
    }

    private func handleDayChange() {
        let today = Date()
        queue.async { [weak self] in
            guard let self else { return }
            _ = Self.ensureNoteExists(for: today, cache: &self.cache, queue: self.queue, baseURL: self.baseURL, decoder: self.decoder, encoder: self.encoder, formatter: self.isoFormatter, fileManager: self.fileManager)
        }
        DispatchQueue.main.async {
            self.setActiveDate(today)
        }
        if case let .keepDays(days) = prunePolicy {
            pruneOldNotes(keepDays: days)
        }
    }

    private static func ensureNoteExists(
        for date: Date,
        cache: inout [String: DailyNote],
        queue: DispatchQueue,
        baseURL: URL,
        decoder: JSONDecoder,
        encoder: JSONEncoder,
        formatter: DateFormatter,
        fileManager: FileManager
    ) -> DailyNote {
        let dateString = formatter.string(from: date)
        if let cached = cache[dateString] {
            return cached
        }
        let url = baseURL.appendingPathComponent("\(dateString).json", isDirectory: false)
        if let data = try? Data(contentsOf: url), let decoded = try? decoder.decode(DailyNote.self, from: data) {
            cache[dateString] = decoded
            return decoded
        }
        let note = DailyNote(date: dateString, content: "", updatedAt: Date())
        cache[dateString] = note
        queue.async {
            if !fileManager.fileExists(atPath: baseURL.path) {
                try? fileManager.createDirectory(at: baseURL, withIntermediateDirectories: true)
            }
            if let data = try? encoder.encode(note) {
                try? data.write(to: url, options: [.atomic])
            }
        }
        return note
    }
}
