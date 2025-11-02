import Foundation

/// Represents a scratch note for a particular day.
public struct DailyNote: Codable, Equatable, Identifiable {
    public var id: String { date }
    public var date: String
    public var content: String
    public var updatedAt: Date

    public init(date: String, content: String = "", updatedAt: Date = Date()) {
        self.date = date
        self.content = content
        self.updatedAt = updatedAt
    }
}
