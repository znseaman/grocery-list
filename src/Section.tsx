import React from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
import {CollisionPriority} from '@dnd-kit/abstract';
import clsx from 'clsx';

export default function Section({id, section, index, itemCount = 0, children}: {id: string; section: string; index: number; itemCount?: number; children?: React.ReactNode}) {
  const {ref, isDropTarget} = useSortable({
    id,
    index,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"]
  });

  return (
    <div
      ref={ref}
      className={clsx("grid-3x4", section == "None" ? "droppable-row": "droppable", isDropTarget ? "active" : "")}
      style={{ "--item-count": itemCount } as React.CSSProperties}
    >
      <h2 className="underline">{section == "None" ? "" : section}</h2>
      {children}
    </div>
  );
}