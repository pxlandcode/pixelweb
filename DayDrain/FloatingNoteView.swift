import Combine
import SwiftUI

struct FloatingNoteView: View {
    @ObservedObject var manager: ToDoManager
    @Binding var isPinned: Bool
    var togglePin: () -> Void

    @State private var draftContent: String = ""
    @State private var showHeader: Bool = false

    private let headerHeight: CGFloat = 44
    private let dateFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale.current
        formatter.dateFormat = "EEEE · MMM d"
        return formatter
    }()

    var body: some View {
        ZStack(alignment: .top) {
            NotesEditor(text: $draftContent, onCommit: commit, onCopyAll: manager.copyNoteToClipboard)
                .padding(.top, headerHeight)
                .id(manager.currentNote.date)
                .animation(.easeInOut(duration: 0.2), value: manager.currentNote.date)
                .transition(.opacity)
            header
                .frame(height: headerHeight)
                .background(.ultraThinMaterial)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .padding(.horizontal, 8)
                .padding(.top, 4)
                .opacity(showHeader ? 1 : 0)
                .animation(.easeInOut(duration: 0.25), value: showHeader)
        }
        .padding(.horizontal, 8)
        .padding(.bottom, 12)
        .onAppear {
            draftContent = manager.currentNote.content
        }
        .onReceive(manager.$currentNote) { note in
            if note.content != draftContent {
                withAnimation(.easeInOut(duration: 0.2)) {
                    draftContent = note.content
                }
            }
        }
        .onChange(of: draftContent) { newValue in
            manager.updateNoteContent(newValue)
        }
        .onHover { hovering in
            showHeader = hovering
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            Button(action: manager.jumpToPreviousDay) {
                Image(systemName: "chevron.left")
            }
            .buttonStyle(.plain)

            Spacer()

            Text(dateFormatter.string(from: manager.selectedNoteDate))
                .font(.headline)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 8)

            Spacer()

            Button(action: manager.jumpToNextDay) {
                Image(systemName: "chevron.right")
            }
            .buttonStyle(.plain)

            Button(action: togglePin) {
                Text(isPinned ? "📌" : "📍")
            }
            .buttonStyle(.plain)
            .help(isPinned ? "Unpin window" : "Pin window")
        }
    }

    private func commit(_ content: String) {
        manager.updateNoteContent(content)
    }
}
