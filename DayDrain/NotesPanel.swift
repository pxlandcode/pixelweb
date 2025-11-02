import AppKit
import Combine
import SwiftUI

struct NotesPanel: View {
    @ObservedObject var manager: ToDoManager
    var openFloatingWindow: () -> Void

    @State private var draftContent: String = ""

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            header
            NotesEditor(text: $draftContent, onCommit: commit, onCopyAll: manager.copyNoteToClipboard)
                .frame(minHeight: 160)
                .background(PanelBackground())
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .transition(.opacity)
                .animation(.easeInOut(duration: 0.2), value: manager.currentNote.date)
        }
        .padding()
        .onAppear {
            draftContent = manager.currentNote.content
        }
        .onReceive(manager.$currentNote) { note in
            if note.content != draftContent {
                draftContent = note.content
            }
        }
        .onChange(of: draftContent) { newValue in
            manager.updateNoteContent(newValue)
        }
    }

    private var header: some View {
        HStack {
            Text("Notes")
                .font(.headline)
            Spacer()
            Button(action: openFloatingWindow) {
                Label("Open Outside", systemImage: "arrow.up.right")
                    .labelStyle(.titleAndIcon)
            }
            .buttonStyle(.borderless)
        }
    }

    private func commit(_ content: String) {
        manager.updateNoteContent(content)
    }
}

private struct PanelBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        RoundedRectangle(cornerRadius: 12, style: .continuous)
            .fill(colorScheme == .dark ? Color(nsColor: .windowBackgroundColor) : Color(nsColor: .textBackgroundColor))
    }
}
