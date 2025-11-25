import { writable, derived, type Writable } from 'svelte/store';
import type { Resume, ResumeBlock, ResumeVersion } from '$lib/services/resumes';

export type ResumeEditingState = {
        resume: Resume | null;
        activeVersion: ResumeVersion | null;
        blocks: ResumeBlock[];
};

const createResumeStore = () => {
        const state: Writable<ResumeEditingState> = writable({
                resume: null,
                activeVersion: null,
                blocks: []
        });

        const setResume = (resume: Resume) => {
                state.set({
                        resume,
                        activeVersion: resume.versions?.find((v) => v.is_main) ?? null,
                        blocks: resume.content
                });
        };

        const updateBlocks = (updater: (current: ResumeBlock[]) => ResumeBlock[]) => {
                state.update((current) => ({ ...current, blocks: updater(current.blocks) }));
        };

        const setActiveVersion = (versionId: string) => {
                        state.update((current) => {
                                const next = current.resume?.versions?.find((v) => v.id === versionId) ?? null;
                                return { ...current, activeVersion: next, blocks: next?.content ?? current.blocks };
                        });
        };

        const blockSummary = derived(state, ($state) => ({
                total: $state.blocks.length,
                hasContact: $state.blocks.some((b) => b.type === 'contact'),
                hasTitle: $state.blocks.some((b) => b.type === 'title')
        }));

        return { state, setResume, updateBlocks, setActiveVersion, summary: blockSummary };
};

export const resumeStore = createResumeStore();
