import AppKit
import SwiftUI

final class MenuBarController: NSObject {
    private let statusItem: NSStatusItem
    private let popover: NSPopover
    private let manager: ToDoManager
    private let floatingNoteController: FloatingNoteWindowController

    init(manager: ToDoManager = ToDoManager()) {
        self.manager = manager
        self.statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        self.popover = NSPopover()
        self.floatingNoteController = FloatingNoteWindowController(manager: manager)
        super.init()
        configureStatusItem()
        configurePopover()
    }

    private func configureStatusItem() {
        if let button = statusItem.button {
            button.title = "DayDrain"
            button.action = #selector(togglePopover(_:))
            button.target = self
        }
    }

    private func configurePopover() {
        popover.behavior = .transient
        popover.contentSize = NSSize(width: 360, height: 480)
        popover.contentViewController = NSHostingController(rootView: ToDoPanel(manager: manager) { [weak self] in
            self?.floatingNoteController.present()
        })
    }

    @objc private func togglePopover(_ sender: Any?) {
        if popover.isShown {
            popover.performClose(sender)
        } else if let button = statusItem.button {
            popover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY)
            NSApp.activate(ignoringOtherApps: true)
        }
    }

    func showFloatingNotes() {
        floatingNoteController.present()
    }
}
