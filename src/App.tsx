import { MouseEvent, RefObject, useRef, useState } from 'react';
import './App.css'

const colors = [
  // https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
  ["ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff", "a0c4ff", "bdb2ff", "ffc6ff", "fffffc"],
  // https://coolors.co/palette/eddcd2-fff1e6-fde2e4-fad2e1-c5dedd-dbe7e4-f0efeb-d6e2e9-bcd4e6-99c1de
  ["eddcd2", "fff1e6", "fde2e4", "fad2e1", "c5dedd", "dbe7e4", "f0efeb", "d6e2e9", "bcd4e6", "99c1de"],
  // https://coolors.co/palette/eae4e9-fff1e6-fde2e4-fad2e1-e2ece9-bee1e6-f0efeb-dfe7fd-cddafd
  ["eae4e9", "fff1e6", "fde2e4", "fad2e1", "e2ece9", "bee1e6", "f0efeb", "dfe7fd", "cddafd"],
];
const color = colors[2];

export default function App() {
  type line = { x1: number, y1: number, x2: number, y2: number; };
  const [lines, setLines] = useState<line[]>([]);
  const addLine = (l: line) => setLines([...lines, l]);
  const line = useRef<SVGLineElement>(null);

  const m = [
    [1, 1, 2, 1],
    [3, 2, 1, 1],
    [2, 5, 6, 8],
    [4, 2, 2, 1],
    [1, 1, 2, 7],
  ];
  const rows = m.length;
  const cols = m[0].length;
  const fields = m.flatMap((row, irow) => row.map((col, icol) => <Field x={icol} y={irow} n={col} line={line} />));


  return (
    <div className="App">
      <h1>2248</h1>
      <div className="Fields" style={{gridTemplateColumns: 'auto '.repeat(cols)}}>
        {fields}
      </div>
      <svg className="lines" width="100vw" height="100vh">
        {lines.map(o => <line {...o} />)}
        <line ref={line} id="line" />
      </svg>
    </div>
  )
}

const Field = (o : { x: number, y: number, n: number, line: RefObject<SVGLineElement> }) => {
  const text = 2**o.n;
  const down = (e: MouseEvent) => {
    console.log('down:', text);
  };
  const enter = (e: MouseEvent) => {
    console.log('enter:', text);
  };
  const move = (e: MouseEvent) => {
    // console.log('move:', e.clientX);
    const l = document.querySelector<SVGLineElement>('#line');
    if (!l) return;
    // l.x1.baseVal.value = e.clientX - 100;
    l.y1.baseVal.value = e.clientY - 100;
    l.x2.baseVal.value = e.clientX;
    l.y2.baseVal.value = e.clientY;
    const l2 = o.line.current;
    if (!l2) return;
    l2.x1.baseVal.value = e.clientX - 100;
  };
  const leave = (e: MouseEvent) => {
    console.log('leave:', text);
  };
  const up = (e: MouseEvent) => {
    console.log('up:', text);
  };
  return <button className="Field" style={{backgroundColor: '#'+color[o.n-1]}}
    onMouseDown={down} onMouseEnter={enter} onMouseMove={move} onMouseLeave={leave} onMouseUp={up} > {text} </button>;
};
