import type { Task, QaqcChecklistItem, QaqcSignoffResult } from '@/types';

export interface StageProgress {
  flow: string;
  stage: string;
  constructionPercent: number;
  taskCount: number;
  qaqcPercent: number;
  itemCount: number;
}

export function computeConstructionPercent(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return Math.round(tasks.reduce((sum, t) => sum + t.percent_complete, 0) / tasks.length);
}

/**
 * % of checklist template items that have at least one "pass" signoff result
 * recorded anywhere on the site. This measures template coverage, not a count
 * of individual locations (rows, piers, etc), since QAQC signoffs are per-location
 * and there's no fixed total location count to divide by.
 */
export function computeQaqcPercent(checklistItems: QaqcChecklistItem[], signoffResults: QaqcSignoffResult[]): number {
  if (checklistItems.length === 0) return 0;
  const passedItemIds = new Set(signoffResults.filter((r) => r.result === 'pass').map((r) => r.checklist_item_id));
  const passedCount = checklistItems.filter((i) => passedItemIds.has(i.id)).length;
  return Math.round((passedCount / checklistItems.length) * 100);
}

/**
 * Breaks both Construction % and QAQC % down by Flow > Stage, using the
 * checklist template's flow/stage list as the master structure so every
 * stage shows up even if no tasks or signoffs exist for it yet.
 */
export function computeStageBreakdown(
  checklistItems: QaqcChecklistItem[],
  tasks: Task[],
  signoffResults: QaqcSignoffResult[]
): StageProgress[] {
  const passedItemIds = new Set(signoffResults.filter((r) => r.result === 'pass').map((r) => r.checklist_item_id));

  const seen = new Set<string>();
  const order: { flow: string; stage: string }[] = [];
  for (const item of checklistItems) {
    const key = `${item.flow}|||${item.stage}`;
    if (!seen.has(key)) {
      seen.add(key);
      order.push({ flow: item.flow, stage: item.stage });
    }
  }

  return order.map(({ flow, stage }) => {
    const stageItems = checklistItems.filter((i) => i.flow === flow && i.stage === stage);
    const stageTasks = tasks.filter((t) => t.flow === flow && t.stage === stage);
    const passedCount = stageItems.filter((i) => passedItemIds.has(i.id)).length;

    return {
      flow,
      stage,
      constructionPercent: computeConstructionPercent(stageTasks),
      taskCount: stageTasks.length,
      qaqcPercent: stageItems.length > 0 ? Math.round((passedCount / stageItems.length) * 100) : 0,
      itemCount: stageItems.length,
    };
  });
}
