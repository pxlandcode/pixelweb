import { writable, derived, type Writable } from 'svelte/store';
import type { Resume, ResumeBlock, ResumeVersion } from '$lib/services/resumes';

export type ResumeEditingState = {
        resume: Resume | null;
        activeVersion: ResumeVersion | null;
        blocks: ResumeBlock[];
};

const withIds = (blocks: ResumeBlock[]) =>
        blocks.map((block) => ({
                ...block,
                id: block.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)
        }));

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
                        blocks: withIds(resume.content)
                });
        };

        const updateBlocks = (updater: (current: ResumeBlock[]) => ResumeBlock[]) => {
                state.update((current) => ({ ...current, blocks: withIds(updater(current.blocks)) }));
        };

        const setActiveVersion = (versionId: number) => {
                state.update((current) => {
                        const next = current.resume?.versions?.find((v) => v.id === versionId) ?? null;
                        return { ...current, activeVersion: next, blocks: withIds(next?.content ?? current.blocks) };
                });
        };

        const toggleHidden = (blockId: string) => {
                updateBlocks((blocks) =>
                        blocks.map((block) => (block.id === blockId ? { ...block, hidden: !block.hidden } : block))
                );
        };

        const moveBlock = (blockId: string, direction: 'up' | 'down') => {
                updateBlocks((blocks) => {
                        const index = blocks.findIndex((b) => b.id === blockId);
                        if (index === -1) return blocks;
                        const target = direction === 'up' ? index - 1 : index + 1;
                        if (target < 0 || target >= blocks.length) return blocks;
                        const copy = [...blocks];
                        const [block] = copy.splice(index, 1);
                        copy.splice(target, 0, block);
                        return copy;
                });
        };

        const removeBlock = (blockId: string) => {
                updateBlocks((blocks) => blocks.filter((block) => block.id !== blockId));
        };

        const blockSummary = derived(state, ($state) => ({
                total: $state.blocks.length,
                hasHeader: $state.blocks.some((b) => b.type === 'header'),
                visible: $state.blocks.filter((b) => !b.hidden).length
        }));

        return {
                state,
                setResume,
                updateBlocks,
                setActiveVersion,
                toggleHidden,
                moveBlock,
                removeBlock,
                summary: blockSummary
        };
};

export const resumeStore = createResumeStore();
