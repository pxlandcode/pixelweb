import AppKit
import SwiftUI

final class FloatingNoteWindowController: NSObject, NSWindowDelegate {
    private let manager: ToDoManager
    private var window: NSPanel?
    private var hostingController: NSHostingController<FloatingNoteView>?
    private var isPinned: Bool

    private let pinDefaultsKey = "FloatingNotePinnedState"

    init(manager: ToDoManager) {
        self.manager = manager
        let stored = UserDefaults.standard.object(forKey: pinDefaultsKey) as? Bool ?? false
        self.isPinned = stored
        super.init()
    }

    func present() {
        if window == nil {
            createWindow()
        }
        window?.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func close() {
        window?.close()
    }

    private func createWindow() {
        let panel = NSPanel(
            contentRect: NSRect(x: 0, y: 0, width: 420, height: 540),
            styleMask: [.titled, .closable, .resizable, .fullSizeContentView],
            backing: .buffered,
            defer: false
        )
        panel.titleVisibility = .hidden
        panel.titlebarAppearsTransparent = true
        panel.isFloatingPanel = true
        panel.hasShadow = true
        panel.delegate = self
        panel.isReleasedWhenClosed = false
        panel.collectionBehavior = [.fullScreenAuxiliary, .stationary]
        panel.setFrameAutosaveName("FloatingNoteWindow")
        panel.minSize = NSSize(width: 320, height: 320)
        updateWindowLevel(panel)

        let hostingController = NSHostingController(rootView: makeRootView())
        panel.contentViewController = hostingController
        self.hostingController = hostingController
        panel.center()
        window = panel
    }

    private func togglePin() {
        setPinned(!isPinned)
    }

    private func setPinned(_ pinned: Bool) {
        guard pinned != isPinned else { return }
        isPinned = pinned
        UserDefaults.standard.set(pinned, forKey: pinDefaultsKey)
        if let panel = window {
            updateWindowLevel(panel)
        }
        hostingController?.rootView = makeRootView()
    }

    private func makeRootView() -> FloatingNoteView {
        FloatingNoteView(
            manager: manager,
            isPinned: Binding(
                get: { self.isPinned },
                set: { [weak self] newValue in self?.setPinned(newValue) }
            ),
            togglePin: { [weak self] in self?.togglePin() }
        )
    }

    private func updateWindowLevel(_ panel: NSPanel) {
        panel.level = isPinned ? .floating : .normal
    }

    func windowWillClose(_ notification: Notification) {
        window = nil
    }
}
