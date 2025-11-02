import AppKit
import Combine
import Foundation

public final class ToDoManager: ObservableObject {
    @Published public private(set) var currentNote: DailyNote
    @Published public var selectedNoteDate: Date {
        didSet {
            let normalized = calendar.startOfDay(for: selectedNoteDate)
            if normalized != selectedNoteDate {
                selectedNoteDate = normalized
                return
            }
            guard !calendar.isDate(selectedNoteDate, inSameDayAs: oldValue) else { return }
            notesManager.setActiveDate(selectedNoteDate)
        }
    }

    public var notePublisher: AnyPublisher<DailyNote, Never> {
        notesManager.activeNotePublisher
    }

    private let notesManager: NotesManager
    private let calendar = Calendar(identifier: .gregorian)
    private var cancellables: Set<AnyCancellable> = []
    private var observers: [NSObjectProtocol] = []

    public init(notesManager: NotesManager = NotesManager()) {
        self.notesManager = notesManager
        let today = calendar.startOfDay(for: Date())
        self.selectedNoteDate = today
        self.currentNote = notesManager.note(for: today)
        setupBindings()
        setupObservers()
        notesManager.setActiveDate(today)
    }

    deinit {
        observers.forEach { NotificationCenter.default.removeObserver($0) }
    }

    private func setupBindings() {
        notesManager.activeNotePublisher
            .receive(on: DispatchQueue.main)
            .sink { [weak self] note in
                self?.currentNote = note
            }
            .store(in: &cancellables)
    }

    private func setupObservers() {
        let observer = NotificationCenter.default.addObserver(forName: .NSCalendarDayChanged, object: nil, queue: .main) { [weak
 self] _ in
            self?.handleDayRollover()
        }
        observers.append(observer)
    }

    private func handleDayRollover() {
        let today = calendar.startOfDay(for: Date())
        selectedNoteDate = today
    }

    public func updateNoteContent(_ content: String) {
        notesManager.updateNote(content: content, for: selectedNoteDate)
    }

    public func jumpToPreviousDay() {
        guard let newDate = calendar.date(byAdding: .day, value: -1, to: selectedNoteDate) else { return }
        selectedNoteDate = newDate
    }

    public func jumpToNextDay() {
        guard let newDate = calendar.date(byAdding: .day, value: 1, to: selectedNoteDate) else { return }
        selectedNoteDate = newDate
    }

    public func copyNoteToClipboard() {
        let pasteboard = NSPasteboard.general
        pasteboard.clearContents()
        pasteboard.setString(currentNote.content, forType: .string)
    }
}
