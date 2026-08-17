import {useSortable} from '@dnd-kit/react/sortable';

export default function Sortable({id, name, index}: {id: string; name: string; index: number;}) {
  const {ref} = useSortable({id, index});

  return (
    <li ref={ref} className="item">{name}</li>
  );
}