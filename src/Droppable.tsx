import {useDroppable} from '@dnd-kit/react';
import clsx from 'clsx';

export default function Droppable({id, section, itemCount = 0, children}: {id: string; section: string; itemCount?: number; children?: React.ReactNode}) {
  const {ref, isDropTarget} = useDroppable({id});

  return (
    <div
      ref={ref}
      className={clsx("grid-3x4", section == "" ? "droppable-row": "droppable", isDropTarget ? "active" : "")}
      style={{ "--item-count": itemCount } as React.CSSProperties}
    >
      <h2 className="underline">{section}</h2>
      {children}
    </div>
  );
}