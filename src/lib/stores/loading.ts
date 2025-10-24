import { writable } from 'svelte/store';

type LoadingOptions = {
        title?: string;
        message?: string;
        forceDialog?: boolean;
        spinnerDelayMs?: number;
        dialogDelayMs?: number;
        rotationIntervalMs?: number;
        messages?: string[];
};

type LoadingState = {
        active: boolean;
        spinnerVisible: boolean;
        dialogVisible: boolean;
        title: string;
        message: string;
        forceDialog: boolean;
};

const DEFAULT_TITLE = 'Loading AI insights…';
const DEFAULT_MESSAGES = [
        'Warming up the compatibility scanners…',
        'Weaving Brave SERPs into LLM lore…',
        'Convincing models to spill their secrets…'
];

const createLoadingStore = () => {
        const { subscribe, set, update } = writable<LoadingState>({
                active: false,
                spinnerVisible: false,
                dialogVisible: false,
                title: DEFAULT_TITLE,
                message: DEFAULT_MESSAGES[0]!,
                forceDialog: false
        });

        let spinnerTimer: ReturnType<typeof setTimeout> | null = null;
        let dialogTimer: ReturnType<typeof setTimeout> | null = null;
        let rotationTimer: ReturnType<typeof setInterval> | null = null;
        let rotationIndex = 0;
        let rotationMessages = DEFAULT_MESSAGES;

        const clearTimers = () => {
                if (spinnerTimer) {
                        clearTimeout(spinnerTimer);
                        spinnerTimer = null;
                }
                if (dialogTimer) {
                        clearTimeout(dialogTimer);
                        dialogTimer = null;
                }
                if (rotationTimer) {
                        clearInterval(rotationTimer);
                        rotationTimer = null;
                }
        };

        const beginRotation = (intervalMs: number) => {
                if (rotationTimer) {
                        clearInterval(rotationTimer);
                        rotationTimer = null;
                }
                if (rotationMessages.length <= 1) return;
                rotationTimer = setInterval(() => {
                        rotationIndex = (rotationIndex + 1) % rotationMessages.length;
                        update((state) => ({
                                ...state,
                                message: rotationMessages[rotationIndex] ?? state.message
                        }));
                }, intervalMs);
        };

        return {
                subscribe,
                start(options: LoadingOptions = {}) {
                        clearTimers();
                        rotationMessages = options.messages?.length
                                ? options.messages
                                : DEFAULT_MESSAGES;
                        rotationIndex = 0;
                        const spinnerDelay = options.forceDialog
                                ? options.spinnerDelayMs ?? 0
                                : options.spinnerDelayMs ?? 1_000;
                        const dialogDelay = options.forceDialog
                                ? options.dialogDelayMs ?? 0
                                : options.dialogDelayMs ?? 3_000;
                        const rotationDelay = options.rotationIntervalMs ?? 4_000;

                        set({
                                active:
                                        options.forceDialog || spinnerDelay === 0 || dialogDelay === 0,
                                spinnerVisible: options.forceDialog || spinnerDelay === 0,
                                dialogVisible: dialogDelay === 0,
                                title: options.title ?? DEFAULT_TITLE,
                                message:
                                        options.message ?? rotationMessages[0] ?? DEFAULT_MESSAGES[0]!,
                                forceDialog: Boolean(options.forceDialog)
                        });

                        if (spinnerDelay > 0) {
                                spinnerTimer = setTimeout(() => {
                                        update((state) => ({
                                                ...state,
                                                active: true,
                                                spinnerVisible: true
                                        }));
                                }, spinnerDelay);
                        }
                        if (dialogDelay > 0 || options.forceDialog) {
                                dialogTimer = setTimeout(() => {
                                        update((state) => ({
                                                ...state,
                                                active: true,
                                                dialogVisible: true
                                        }));
                                        beginRotation(rotationDelay);
                                }, dialogDelay);
                        } else {
                                beginRotation(rotationDelay);
                        }
                },
                updateMessage(message: string) {
                        update((state) => ({
                                ...state,
                                message
                        }));
                },
                pushMessage(message: string) {
                        rotationMessages = [...rotationMessages, message];
                        rotationIndex = rotationMessages.length - 1;
                        update((state) => ({
                                ...state,
                                message
                        }));
                },
                setMessages(messages: string[]) {
                        rotationMessages = messages.length ? messages : DEFAULT_MESSAGES;
                        rotationIndex = 0;
                        update((state) => ({
                                ...state,
                                message: rotationMessages[0] ?? state.message
                        }));
                },
                fail(message?: string) {
                        clearTimers();
                        set({
                                active: true,
                                spinnerVisible: false,
                                dialogVisible: true,
                                title: 'Something went sideways…',
                                message: message ?? 'The AI toolkit lost the signal. Please try again shortly.',
                                forceDialog: true
                        });
                },
                stop() {
                        clearTimers();
                        rotationMessages = DEFAULT_MESSAGES;
                        rotationIndex = 0;
                        set({
                                active: false,
                                spinnerVisible: false,
                                dialogVisible: false,
                                title: DEFAULT_TITLE,
                                message: DEFAULT_MESSAGES[0]!,
                                forceDialog: false
                        });
                }
        };
};

export const loading = createLoadingStore();
export type { LoadingOptions, LoadingState };
