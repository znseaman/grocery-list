import { useState } from 'react';
import './App.css';

type Item = {
  id: number;
  name: string;
  section: string;
  inCart: boolean;
};

const defaultItem = {id: 1, name: "", section: "Fresh Produce", inCart: false};

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
      name: event.target.value,
    });
  }

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItem({
      ...item,
      section: event.target.value
    });
  }

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (item.name.trim().length === 0) return;

    setItem({
      ...item,
      id: Date.now(),
    });
    
    setItems([item, ...items]);
    localStorage.setItem("grocery-list-items", JSON.stringify([item, ...items]));
    setItem({...item, name: ""});
  }

  const handleChangeChecked = (item: Item) => {
    const index = items.indexOf(item);
    item.inCart = !item.inCart;
    items.splice(index, 1, item);
    setItems([...items]);
    localStorage.setItem("grocery-list-items", JSON.stringify(items));
  }

  const handleDelete = (id: number) => {
    const index = items.findIndex((item) => item.id === id);
    items.splice(index, 1);
    setItems([...items]);
    localStorage.setItem("grocery-list-items", JSON.stringify([...items]));
  }

  const handleRemoveAllItems = (event: React.FormEvent) => {
    event.preventDefault();
    setItems([]);
    localStorage.setItem("grocery-list-items", JSON.stringify([]));
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <h2>Grocery List</h2>
        </div>
        <div className="grid-3x4">
          {AISLES.map((section, index) => {
            const sectionItems = items
              .filter((curr) => curr.section === section)
              .sort((a, b) => Number(a.inCart) - Number(b.inCart));

            return (
              <div
                key={index}
                className="grid-cell"
                style={{ "--item-count": sectionItems.length } as React.CSSProperties}
              >
                <h2 className="underline">{section}</h2>
                <ul>
                  {sectionItems.map((item) => (
                    <li key={item.name + item.id}>
                      <label htmlFor={item.name + item.id} style={{textDecoration: item.inCart ? "line-through" : "none" }}>
                        <input
                          type="checkbox"
                          name="inCart"
                          id={item.name + item.id}
                          checked={item.inCart}
                          onChange={() => handleChangeChecked(item)}
                        />
                        {item.name}
                      </label>
                      <button className="bg-red-500 text-white rounded-md px-4 py-1" onClick={() => handleDelete(item.id)}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <form onSubmit={handleFormSubmit}>
            <label htmlFor={item.name + item.id}>
              Item: <input type="text" name="item" id={item.name + item.id} className="border-2 border-gray-700 focus:border-pink-600" onChange={handleInput} value={item.name} />
            </label>
            
            <select name="section" value={item.section} onChange={handleChange}>
              {AISLES.map((section) => (
                <option key={section} value={section}>{section}</option>
              ))}
            </select>
            <button className="bg-blue-500 text-white rounded-md px-4 py-2" type="submit">Add</button>
          </form>
          <form className="danger-zone" onSubmit={handleRemoveAllItems}>
            <button className="bg-red-500 text-white rounded-md px-4 py-2" type="submit">Remove All Items</button>
          </form>
        </div>
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
