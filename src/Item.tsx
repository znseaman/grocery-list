import {useRef, useState} from 'react';
import {useSortable} from '@dnd-kit/react/sortable';
import clsx from 'clsx';

export default function Item({id, index, name, section, inCart, handleChangeChecked, handleDelete}: {id: string, index: number, name: string, section: string, inCart: boolean, handleChangeChecked: (id: string)=>void; handleDelete: (id: string, section: string)=>void}) {
  const [element, _] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {ref, isDragging} = useSortable({
    id,
    index,
    type: 'item',
    accept: 'item',
    group: section,
    element,
    handle: handleRef,
    target: element
  });

  return (
    <li ref={ref} className={clsx("item", isDragging ? "active" : "")} key={id + name} data-dragging={isDragging}>
      <button ref={handleRef} className="handle" />
      <label htmlFor={id + "-" + name} style={{textDecoration: inCart ? "line-through" : "none" }}>
        <input
          type="checkbox"
          name="inCart"
          id={id + "-" + name}
          checked={inCart}
          onChange={() => handleChangeChecked(id)}
        />
        {` ${name}`}
      </label>
      <button className="bg-red-500 text-white rounded-md px-4 py-1" onClick={() => handleDelete(id, section)}>x</button>
    </li>
  );
}