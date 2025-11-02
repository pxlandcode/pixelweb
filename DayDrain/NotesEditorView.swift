import AppKit
import SwiftUI

struct NotesEditor: NSViewRepresentable {
    @Binding var text: String
    var onCommit: (String) -> Void
    var onCopyAll: () -> Void

    func makeCoordinator() -> Coordinator {
        Coordinator(parent: self)
    }

    func makeNSView(context: Context) -> NotesNSTextView {
        let textView = NotesNSTextView()
        textView.customDelegate = context.coordinator
        textView.delegate = context.coordinator
        textView.isRichText = false
        textView.drawsBackground = false
        textView.font = .monospacedSystemFont(ofSize: 14, weight: .regular)
        textView.textContainerInset = NSSize(width: 8, height: 8)
        textView.string = text
        DispatchQueue.main.async {
            textView.window?.makeFirstResponder(textView)
        }
        return textView
    }

    func updateNSView(_ nsView: NotesNSTextView, context: Context) {
        if nsView.string != text {
            nsView.string = text
        }
    }

    final class Coordinator: NSObject, NSTextViewDelegate, NotesTextResponderDelegate {
        var parent: NotesEditor

        init(parent: NotesEditor) {
            self.parent = parent
        }

        func textDidChange(_ notification: Notification) {
            guard let textView = notification.object as? NSTextView else { return }
            parent.text = textView.string
        }

        func textDidEndEditing(_ notification: Notification) {
            parent.onCommit(parent.text)
        }

        func notesTextViewDidRequestCopyAll(_ textView: NotesNSTextView) {
            parent.onCopyAll()
        }

        func notesTextView(_ textView: NotesNSTextView, didWrap selection: NSRange, with text: String) {
            parent.text = textView.string
            parent.onCommit(parent.text)
        }
    }
}

private protocol NotesTextResponderDelegate: AnyObject {
    func notesTextViewDidRequestCopyAll(_ textView: NotesNSTextView)
    func notesTextView(_ textView: NotesNSTextView, didWrap selection: NSRange, with text: String)
}

final class NotesNSTextView: NSTextView {
    weak var customDelegate: (any NotesTextResponderDelegate)?

    override func keyDown(with event: NSEvent) {
        if event.modifierFlags.contains(.command) {
            if event.charactersIgnoringModifiers?.lowercased() == "b" {
                wrapSelection(prefix: "**", suffix: "**")
                return
            } else if event.charactersIgnoringModifiers?.lowercased() == "i" {
                wrapSelection(prefix: "*", suffix: "*")
                return
            } else if event.modifierFlags.contains(.shift) && event.charactersIgnoringModifiers?.lowercased() == "c" {
                customDelegate?.notesTextViewDidRequestCopyAll(self)
                return
            }
        }
        super.keyDown(with: event)
    }

    private func wrapSelection(prefix: String, suffix: String) {
        guard let range = selectedRanges.first as? NSRange else { return }
        let original = (string as NSString).substring(with: range)
        let insertion = prefix + original + suffix
        guard shouldChangeText(in: range, replacementString: insertion) else { return }
        textStorage?.replaceCharacters(in: range, with: insertion)
        didChangeText()
        let newLocation = range.location + prefix.count
        setSelectedRange(NSRange(location: newLocation, length: range.length))
        customDelegate?.notesTextView(self, didWrap: range, with: insertion)
    }
}
