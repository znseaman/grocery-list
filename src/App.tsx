import { useState } from 'react';
import './App.css';
import {DragDropProvider} from '@dnd-kit/react';
import Draggable from './Draggable';
import Droppable from './Droppable';
import Sortable from './Sortable';

type Item = {
  id: number;
  name: string;
  section: string;
  inCart: boolean;
};

const defaultItem = {id: Date.now(), name: "", section: "", inCart: false};

const AISLES = [
  "Bread & Bakery",
  "Fresh Produce",
  "Meat & Seafood",
  "Deli",
  "Dairy & Eggs",
  "Frozen",
  "Pantry",
  "Breakfast & Cereal",
  "Baking",
  "Beverages",
  "Candy & Snacks",
  "Cleaning & Laundry"
];

function App() {
  const itemsFromLocalStorage: Item[] = JSON.parse(localStorage.getItem("grocery-list-items") ?? "[]");
  const [items, setItems] = useState<Item[]>(itemsFromLocalStorage);
  const [item, setItem] = useState<Item>({...defaultItem});

  const handleInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItem({
      ...item,
      id: Date.now(),
      name: event.target.value,
    });
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItem({
      ...item,
      id: Date.now(),
      section: event.target.value
    });
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (item.name.trim().length === 0) return;

    const newItem = {
      ...item,
      id: Date.now()
    } as Item;
    
    setItems(prevItems => {
      const newItems = [newItem, ...prevItems]
      localStorage.setItem("grocery-list-items", JSON.stringify(newItems));
      return newItems
    });
    setItem({...defaultItem});
  }

  const handleChangeChecked = (id: string) => {
    const index = items.findIndex((item) => `${item.id}-${item.name}` === id);
    setItems(prevItems => prevItems.map((item, idx) =>
      idx === index ? { ...item, inCart: !item.inCart} : item
    ));
    localStorage.setItem("grocery-list-items", JSON.stringify(items));
  }

  const handleDelete = (id: string) => {
    setItems(prevItems => {
      const newItems = prevItems.filter(item => `${item.id}-${item.name}` !== id)
      localStorage.setItem("grocery-list-items", JSON.stringify([...newItems]));
      return newItems
    });
  }

  const handleRemoveAllItems = (event: React.FormEvent) => {
    event.preventDefault();
    setItems(_ => {
      const newItems: Item[] = []
      localStorage.setItem("grocery-list-items", JSON.stringify(newItems));
      return newItems
    });
  }

  const unsectionedItems = items.filter((curr) => !curr.section);

  return (
    <>
      <section id="center">
        <div className="hero">
          <h2>Grocery List</h2>
        </div>
        <div id="docs">
          <form onSubmit={handleFormSubmit}>
            <label htmlFor={item.name + item.id}>
              Item: <input type="text" name="item" id={item.name + item.id} className="border-2 border-gray-700 focus:border-pink-600" onChange={handleInput} value={item.name} />
            </label>
            
            <select name="section" defaultValue="" onChange={handleChange}>
              <option key="-" value="">Select A Section</option>
              {AISLES.map((section, index) => (
                <option key={section + index} value={section}>{section}</option>
              ))}
            </select>
            <button className="bg-blue-500 text-white rounded-md px-4 py-2" type="submit">Add</button>
          </form>
          <form className="danger-zone" onSubmit={handleRemoveAllItems}>
            <button className="bg-red-500 text-white rounded-md px-4 py-2" type="submit">Remove All Items</button>
          </form>
        </div>
        <DragDropProvider
          onDragEnd={(event) => {
            if (event.canceled) return;
            const dropSection = event.operation.target?.id

            const itemId = event.operation.source?.id
            const itemIndex = items.findIndex((item) => `${item.id}-${item.name}` === itemId)

            setItems(prevItems => {
              const newItems = prevItems.map((item, idx) =>
                idx === itemIndex ? { ...item, section: !AISLES.includes(dropSection as string) ? "" : dropSection} : item
              );
              localStorage.setItem("grocery-list-items", JSON.stringify(newItems));
              return newItems as Item[]
            })
          }}
        >
          <Droppable key={""} id={""} section={""} itemCount={unsectionedItems.length}>
            <ul className="list">
            {unsectionedItems.map((item, index) =>
              <Sortable key={item.id + "-" + item.name} id={item.id + "-" + item.name} name={item.name} index={index} />
            )}
          </ul>
          </Droppable>
          {AISLES.map((section, index) => {
            const sectionItems = items
              .filter((curr) => curr.section === section)
              .sort((a, b) => Number(a.inCart) - Number(b.inCart));

            return (
              <Droppable key={index + "-" + section} id={section} section={section} itemCount={sectionItems.length}>
                <ul className="list">
                  {sectionItems.map((item, index) =>
                    <Draggable key={item.id + "-" + item.name} id={item.id + "-" + item.name} index={index} name={item.name} inCart={item.inCart} handleChangeChecked={handleChangeChecked} handleDelete={handleDelete}></Draggable>
                  )}
                </ul>
              </Droppable>
            );
          })}
        </DragDropProvider>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="social">
          <p>Built by Zach Seaman</p>
          <ul>
            <li>
              <a href="https://github.com/znseaman" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}

export default App
