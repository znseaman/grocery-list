import React, {useRef, useState} from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
import {CollisionPriority} from '@dnd-kit/abstract';
import clsx from 'clsx';

export default function Section({id, section, index, itemCount = 0, children}: {id: string; section: string; index: number; itemCount?: number; children?: React.ReactNode}) {
  const [element, _] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {ref, isDropTarget} = useSortable({
    id,
    index,
    type: 'column',
    collisionPriority: CollisionPriority.Low,
    accept: ["item", "column"],
    element,
    handle: handleRef,
    target: element
  });

  return (
    <div
      ref={ref}
      className={clsx("section", "grid-3x4", section == "None" ? "droppable-row": "droppable", isDropTarget ? "active" : "")}
      style={{ "--item-count": itemCount } as React.CSSProperties}
    >
      <div className="section-content">
        <h2 className="underline">{section == "None" ? "" : section}</h2>
        <ul className="list">
          {children}
        </ul>
      </div>
      {section == "None" ? <></> : <button ref={handleRef} className="handle" />}
    </div>
  );
}