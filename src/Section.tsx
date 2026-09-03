import React, {useRef, useState} from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
import {CollisionPriority} from '@dnd-kit/abstract';
import clsx from 'clsx';

export default function Section({id, section, index, itemCount = 0, children, handleDelete, handleEditSection, active}: {id: string; section: string; index: number; itemCount?: number; children?: React.ReactNode, handleDelete: (id: string, section: string)=>void, handleEditSection: (newSectionName: string, section: string)=>void, active: boolean}) {
  const [element, _] = useState<Element | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [sectionName, setSectionName] = useState(section)
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {ref, isDragging, isDropTarget} = useSortable({
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
      className={clsx(section == "None" ? "section-row" : "section", "grid-3x4", section == "None" ? "droppable-row": "droppable", isDragging || isDropTarget || active ? "active" : "")}
      style={{ "--item-count": itemCount } as React.CSSProperties}
    >
      {section == "None" ? <></> : <button ref={handleRef} className="handle" />}
      <div className="section-content">
        {editMode ? 
          <form onSubmit={()=>{
            if (editMode && sectionName !== section) handleEditSection(sectionName, section)
            setEditMode(prevEditMode => !prevEditMode)
          }}>
            <label htmlFor={section}>
              <input type="text" name="item" id={section} className="border-2 border-gray-700 focus:border-pink-600" onChange={(event) => setSectionName(event.target.value)} value={sectionName} />
            </label>
          </form> : 
          <h2 className="">{section == "None" ? "" : `${section} (${itemCount})`}</h2>
        }
        <ul className="list">
          {children}
        </ul>
      </div>
      {section == "None" ? <></> : 
        <div className="section-actions">
          <button className="edit pr-2 py-5 m-8px" onClick={() => {
            if (editMode && sectionName !== section) {
              handleEditSection(sectionName, section)
            }
            setEditMode(prevEditMode => !prevEditMode)
          }}>{editMode ? 'Save' : 'Edit'}</button>
          <button className="bg-red-500 text-white rounded-md px-1 py-1 mx-2 mb-2" onClick={() => handleDelete(id, section)}>x</button>
        </div>
      }
    </div>
  );
}