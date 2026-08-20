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
  const itemObject: Record<string, Item[]> = {}
  for (const section of sectionsFromLocalStorage) {
    if (!Array.isArray(itemsFromLocalStorage)) continue
    const sectionItems = itemsFromLocalStorage.filter((item) => {
      if (item.section === section) return true
      if (item.section === "" && section === "None") return true
      return false
    })
    rawItems.push(...sectionItems)
    itemObject[section] = sectionItems || []
  }
  
  const [items, setItems] = useState<Record<string, Item[]>>({...itemObject});
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
    
    setItems(prevItems => {
      const newItems = {
        ...prevItems,
        [newItem.section]: [newItem, ...prevItems[newItem.section]]
      }
      const allItems: Item[] = []
      for (const section of Object.keys(newItems)) {
        allItems.push(...newItems[section])
      }
      localStorage.setItem("grocery-list-items", JSON.stringify(allItems));
      return newItems
    });
    setItem({...defaultItem});
  }

  const handleChangeChecked = (id: string, section: string) => {
    const index = items[section].findIndex((item) => `${item.id}-${item.name}` === id);
    setItems(prevItems => {
      const updatedItems = prevItems[section].map((item, idx) =>
        idx === index ? { ...item, inCart: !item.inCart} : item
      );

      const newItems = {
        ...prevItems,
        [section] : [...updatedItems]
      };

      const allItems: Item[] = []
      for (const section of Object.keys(newItems)) {
        allItems.push(...newItems[section])
      }
      localStorage.setItem("grocery-list-items", JSON.stringify(allItems));

      return newItems;
    });
  }

  const handleDelete = (id: string, section: string) => {
    setItems(prevItems => {
      const updatedItems = prevItems[section].filter(item => `${item.id}-${item.name}` !== id)

      const newItems = {
        ...prevItems,
        [section] : [...updatedItems]
      };

      const allItems: Item[] = []
      for (const section of Object.keys(newItems)) {
        allItems.push(...newItems[section])
      }

      localStorage.setItem("grocery-list-items", JSON.stringify(allItems));
      return newItems
    });
  }

  const handleRemoveAllItems = (event: React.FormEvent) => {
    event.preventDefault();
    setItems(prevItems => {

      const newItems = {...prevItems}
      for (const section of Object.keys(newItems)) {
        newItems[section] = []
      }

      const allItems: Item[] = []
      localStorage.setItem("grocery-list-items", JSON.stringify(allItems));

      return newItems
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
            
            <select name="section" defaultValue="" onChange={handleChange}>
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
            onDragOver={(event) => {
              const {source} = event.operation;

              if (source?.type === 'column') return;

              setItems((prevItems) => {
                const newItems = move(prevItems, event)
                return newItems
              });
          }}

          onDragEnd={(event) => {
            const {source, target} = event.operation;

            if (event.canceled) return;

            if (source?.type === 'column') {
              setColumnOrder((columns) => {
                const newColumns = move(columns, event)
                localStorage.setItem("grocery-list-sections", JSON.stringify(newColumns));
                return newColumns
              });
              return;
            }

            if (source?.type === 'item') {
              const itemId = source?.id
              const dropSection = target?.id || "None"

              setItems(prevItems => {
                let itemIndex = -1
                let itemOriginSection = ""
                let originalItem: Item = {} as Item
                for (const section of Object.keys(items)) {
                  const idx = items[section].findIndex((item) => `${item.id}-${item.name}` === itemId);
                  if (idx !== -1) {
                    itemOriginSection = section
                    itemIndex = idx
                    originalItem = items[section][idx]
                    break;
                  }
                }
                
                if (itemOriginSection === dropSection || dropSection == `${item.id}-${item.name}` || !Array.isArray(prevItems[dropSection])) return prevItems;

                const updatedOriginItems = prevItems[itemOriginSection].filter((_, idx) => idx !== itemIndex);

                const newItems = {
                  ...prevItems,
                  [itemOriginSection] : [...updatedOriginItems],
                  [dropSection] : [{...originalItem, section: dropSection}, ...prevItems[dropSection]]
                } as Record<string, Item[]>;

                const newestItems = move(newItems, event);

                const allItems: Item[] = []
                for (const section of Object.keys(newestItems)) {
                  allItems.push(...newestItems[section])
                }

                localStorage.setItem("grocery-list-items", JSON.stringify(allItems));
                return newestItems;
              })
              return;
            }
          }}
        >
          {columnOrder.map((section, sectionIdx) => {
            const sectionItems = items[section];
            return (
              <Section key={sectionIdx + "-" + section} id={section} section={section} index={sectionIdx} itemCount={0}>
                <ul className="list">
                  {sectionItems.map((item, index) =>
                    <Item key={item.id + "-" + item.name} id={item.id + "-" + item.name} index={index} name={item.name} inCart={item.inCart} section={item.section} handleChangeChecked={handleChangeChecked} handleDelete={handleDelete}></Item>
                  )}
                </ul>
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
