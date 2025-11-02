import SwiftUI

struct ToDoPanel: View {
    @ObservedObject var manager: ToDoManager
    var openNotesWindow: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            NotesPanel(manager: manager, openFloatingWindow: openNotesWindow)
        }
        .padding()
    }
}
