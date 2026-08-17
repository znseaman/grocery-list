import {useRef, useState} from 'react';
import {useDraggable} from '@dnd-kit/react';
import {useSortable} from '@dnd-kit/react/sortable';

export default function Draggable({id, index, name, inCart, handleChangeChecked, handleDelete}: {id: number, index: number, name: string, inCart: boolean, handleChangeChecked: (id: number)=>void; handleDelete: (id: number)=>void}) {
  const [element, setElement] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {ref} = useDraggable({id, element, handle: handleRef});
//   const {ref} = useSortable({id, index, element, handle: handleRef});

  return (
    <li ref={setElement} className="item" key={id + name}>
      <label htmlFor={id + "-" + name} style={{textDecoration: inCart ? "line-through" : "none" }}>
        <input
          type="checkbox"
          name="inCart"
          id={id + "-" + name}
          checked={inCart}
          onChange={() => handleChangeChecked(id)}
        />
        {name}
      </label>
      <button className="bg-red-500 text-white rounded-md px-4 py-1" onClick={() => handleDelete(id)}>Remove</button>
      <button ref={handleRef} className="handle" />
    </li>
  )

  return (
    <button ref={ref} className="btn">{name}</button>
  );
}