import { useState } from 'react';
import './App.css';
import {DragDropProvider} from '@dnd-kit/react';
import {move} from '@dnd-kit/helpers';
import Item from './Item';
import Section from './Section';

type Item = {
  id: number;
  name: string;
  section: string;
  inCart: boolean;
};

const defaultItem = {id: Date.now(), name: "", section: "None", inCart: false};

const AISLES = [
  "None",
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
  const sectionsFromLocalStorage: string[] = JSON.parse(localStorage.getItem("grocery-list-sections") ?? `${JSON.stringify(AISLES)}`);

  const rawItems: Item[] = []
  const layoutObject: Record<string, string[]> = {}
  for (const section of sectionsFromLocalStorage) {
    if (!Array.isArray(itemsFromLocalStorage)) continue
    const sectionItems = itemsFromLocalStorage.filter((item) => {
      if (item.section === section) return true
      if (item.section === "" && section === "None") return true
      return false
    })
    layoutObject[section] = sectionItems.map((item) => `${item.id}-${item.name}`)
    rawItems.push(...sectionItems)
  }
  
  const [layout, setLayout] = useState<Record<string, string[]>>({...layoutObject});
  const [renderedItems, setRenderedItems] = useState<Item[]>(rawItems)
  const [columnOrder, setColumnOrder] = useState(() => [...sectionsFromLocalStorage]);

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

    setLayout(prevLayout => {
      const newLayout = {
        ...prevLayout,
        [newItem.section]: [...prevLayout[newItem.section], `${newItem.id}-${newItem.name}`]
      };
      return newLayout
    });

    setRenderedItems(prevRenderedItems => {
      const newRenderedItems = [...prevRenderedItems, newItem]
      localStorage.setItem("grocery-list-items", JSON.stringify(newRenderedItems));
      return newRenderedItems
    });
    setItem({...defaultItem});
  }

  const handleChangeChecked = (id: string) => {
    const index = renderedItems.findIndex((item) => `${item.id}-${item.name}` === id);
    setRenderedItems(prevRenderedItems => {
      const updatedItems = prevRenderedItems.map((item, idx) =>
        idx === index ? { ...item, inCart: !item.inCart} : item
      );

      localStorage.setItem("grocery-list-items", JSON.stringify(updatedItems));

      return updatedItems;
    });
  }

  const handleDelete = (id: string, section: string) => {
    setRenderedItems(prevRenderedItems => {
      const updatedItems = prevRenderedItems.filter(item => `${item.id}-${item.name}` !== id);
      localStorage.setItem("grocery-list-items", JSON.stringify(updatedItems));
      return updatedItems;
    });

    setLayout(prevLayout => {
      const updatedItems = prevLayout[section].filter(itemId => itemId !== id);
      const newLayout = {
        ...prevLayout,
        [section] : [...updatedItems]
      };
      return newLayout;
    });
  }

  const handleRemoveAllItems = (event: React.FormEvent) => {
    event.preventDefault();

    setRenderedItems(_ => {
      const allItems: Item[] = [];
      localStorage.setItem("grocery-list-items", JSON.stringify(allItems));
      return allItems;
    });

    setLayout(prevLayout => {
      const newLayout: Record<string, string[]> = {};
      for (const section of Object.keys(prevLayout)) {
        newLayout[section] = [];
      }
      return newLayout;
    });
  }

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
            
            <select name="section" defaultValue={item.section} onChange={handleChange}>
              {columnOrder.map((section, index) => (
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
          onBeforeDragStart={(event) => {
            const {source} = event.operation;

            // Prevent the "None" section from being draggable
            if (source?.type === 'column' && source?.id === "None") {
              event.preventDefault();
            }
          }}

          onDragOver={(event) => {
            const {source, target} = event.operation;

            const targetIndex = columnOrder.findIndex((column) => column === target?.id)
            const sourceIndex = columnOrder.findIndex((column) => column === source?.id)
            const restrictedIndex = 0;

            if (targetIndex <= restrictedIndex && sourceIndex > restrictedIndex) {
              // Prevent the optimistic layout sort behavior
              event.preventDefault(); 
            }

            if (source?.type === 'column') {
              return;
            } 

            setLayout((prevLayout) => {
              const newLayout = move(prevLayout, event)
              return newLayout
            });
          }}

          onDragEnd={(event) => {
            const {source, target} = event.operation;

            if (event.canceled) return;

            if (source?.type === 'column') {
              const overIndex = columnOrder.findIndex((column) => column === target?.id)
              const restrictedIndex = 0;

              // Guard rail: enforce the rule in final state update
              if (overIndex < restrictedIndex) return;

              if (source?.id !== target?.id) {
                setColumnOrder((columns) => {
                  const newColumns = move(columns, event)
                  localStorage.setItem("grocery-list-sections", JSON.stringify(newColumns));
                  return newColumns
                });
              }

              setColumnOrder((columns) => {
                const newColumns = move(columns, event)
                localStorage.setItem("grocery-list-sections", JSON.stringify(newColumns));
                return newColumns
              });
              return;
            }

            if (source?.type === 'item') {
              setLayout((prevLayout) => {
                const allItems: Item[] = [];
                for (const section of Object.keys(prevLayout)) {
                  for (const itemId of prevLayout[section]) {
                    const individualItem = renderedItems.find((item) => `${item.id}-${item.name}` === itemId)
                    if (individualItem) allItems.push({...individualItem, section})
                  }
                }

                setRenderedItems(_ => {
                  localStorage.setItem("grocery-list-items", JSON.stringify(allItems));
                  return allItems;
                });

                return prevLayout;
              });
              return;
            }
          }}
        >
          {columnOrder.map((section, sectionIdx) => {
            const sectionItems = layout[section];
            return (
              <Section key={sectionIdx + "-" + section} id={section} section={section} index={sectionIdx} itemCount={sectionItems.length}>
                {sectionItems.map((itemKey, index) => {
                  let [rawItem] = renderedItems.filter((itemObject) => `${itemObject.id}-${itemObject.name}` === itemKey)
                  return <Item key={rawItem.id + "-" + rawItem.name} id={rawItem.id + "-" + rawItem.name} index={index} name={rawItem.name} inCart={rawItem.inCart} section={rawItem.section} handleChangeChecked={handleChangeChecked} handleDelete={handleDelete}></Item>
                })}
              </Section>
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
