import {useRef, useState} from 'react';
import {useDraggable} from '@dnd-kit/react';

export default function Draggable({id, name, section, inCart, handleChangeChecked, handleDelete}: {id: string, index: number, name: string, section: string, inCart: boolean, handleChangeChecked: (id: string, section: string)=>void; handleDelete: (id: string, section: string)=>void}) {
  const [element, _] = useState<Element | null>(null);
  const handleRef = useRef<HTMLButtonElement | null>(null);
  const {ref} = useDraggable({id, element, handle: handleRef});

  return (
    <li ref={ref} className="item" key={id + name}>
      <label htmlFor={id + "-" + name} style={{textDecoration: inCart ? "line-through" : "none" }}>
        <input
          type="checkbox"
          name="inCart"
          id={id + "-" + name}
          checked={inCart}
          onChange={() => handleChangeChecked(id, section)}
        />
        {name}
      </label>
      <button className="bg-red-500 text-white rounded-md px-4 py-1" onClick={() => handleDelete(id, section)}>Remove</button>
      <button ref={handleRef} className="handle" />
    </li>
  );
}