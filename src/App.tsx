import { Divider, Group, NumberInput, Select } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconColorFilter, IconVolume } from '@tabler/icons-react'; // https://tabler-icons-react.vercel.app/
import { MouseEvent, useEffect, useMemo, useRef, useState } from 'react';
import { ColorSchemeToggle } from './Mantine';
import { duration } from './util';
import './App.css'

const colors = [
  // https://coolors.co/palettes/trending
  ["001219", "005f73", "0a9396", "94d2bd", "e9d8a6", "ee9b00", "ca6702", "bb3e03", "ae2012", "9b2226"],
  ["f94144", "f3722c", "f8961e", "f9844a", "f9c74f", "90be6d", "43aa8b", "4d908e", "577590", "277da1"],
  ["ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff", "a0c4ff", "bdb2ff", "ffc6ff", "f1f1f1"],
  ["fbf8cc", "fde4cf", "ffcfd2", "f1c0e8", "cfbaf0", "a3c4f3", "90dbf4", "8eecf5", "98f5e1", "b9fbc0"],
  ["eddcd2", "fff1e6", "fde2e4", "fad2e1", "c5dedd", "dbe7e4", "f0efeb", "d6e2e9", "bcd4e6", "99c1de"],
  ["eae4e9", "fff1e6", "fde2e4", "fad2e1", "e2ece9", "bee1e6", "f0efeb", "dfe7fd", "cddafd"],
  ["03045e", "023e8a", "0077b6", "0096c7", "00b4d8", "48cae4", "90e0ef", "ade8f4", "caf0f8"],
  ["b7094c", "a01a58", "892b64", "723c70", "5c4d7d", "455e89", "2e6f95", "1780a1", "0091ad"],
  ["54478c", "2c699a", "048ba8", "0db39e", "16db93", "83e377", "b9e769", "efea5a", "f1c453", "f29e4c"],
];

export default function App() {
  // config
  // color palette
  const [colortheme, setColortheme] = useLocalStorage({ key: 'colortheme', defaultValue: 3 });
  const color = (n: number) => '#' + colors[(colortheme-1) % colors.length][n - 1];
  // sound
  const waveforms = ['none', 'sine', 'square', 'triangle', 'sawtooth'] as const;
  type waveform = typeof waveforms[number];
  const [waveform, setWaveform] = useLocalStorage<waveform>({ key: 'waveform', defaultValue: 'triangle' });

  const min = 1;
  const max = 9;
  const rand = () => min + Math.floor(Math.random() * max);
  // matrix of initial field values
  // const m = [
  //   [1, 1, 2, 10],
  //   [3, 2, 1, 1],
  //   [4, 5, 6, 7],
  //   [4, 2, 2, 8],
  //   [1, 1, 2, 9],
  // ];
  // The natural choice would be to have an array for each row such that the string representation of the 2d array matches what is displayed.
  // Since fields should fall down into the places of cleared fields, it's nicer to have columns of values which we can then easily fill up again.
  // So, for the above, m[0] would be the first column of values downwards (i.e. prepend to fill up).
  // Later, we transpose the matrix before displaying the fields row by row.
  const [cols, setCols] = useState(5);
  const [rows, setRows] = useState(5);
  let initialMatrix = useMemo(() => Array(cols).fill(Array(rows).fill(1)).map(col => col.map(rand)), [rows, cols]) as number[][];
  const [matrix, setMatrix] = useState(initialMatrix);

  // state and lines between fields when drawing
  type fieldc = { row: number, col: number, n: number }; // initial args for creating a field
  type pos = { x: number, y: number };
  type field = fieldc & pos; // add rendered position
  const [field, setField] = useState<field>();
  type line = { x1: number, y1: number, x2: number, y2: number; stroke: string };
  // current line when moving mouse, useState would rerender!
  const lineRef = useRef<SVGLineElement>(null);
  const setLineRef = (p: line) => {
    const l = lineRef.current;
    if (!l) return;
    l.x1.baseVal.value = p.x1;
    l.y1.baseVal.value = p.y1;
    l.x2.baseVal.value = p.x2;
    l.y2.baseVal.value = p.y2;
    l.style.stroke = p.stroke;
  };
  const line = (f: field, p: pos): line => ({ x1: f.x, y1: f.y, x2: p.x, y2: p.y, stroke: color(f.n) });
  // already established lines between matching fields
  const [lines, setLines] = useState<line[]>([]);
  const addLine = (line: line) => setLines([...lines, line]);
  const [fields, setFields] = useState<fieldc[]>([]);
  const addField = (field: field) => {
    setFields([...fields, field]);
    setField(field);
  };
  const popField = () => {
    const fr = fields.slice(-1)[0];
    const f = fields.slice(-2)[0];
    setFields(fields.slice(0, -1));
    const l = lines.slice(-1)[0];
    setLines(lines.slice(0, -1));
    setField({...f, x: l.x1, y: l.y1});
    // console.log(2**f.n, fields.map(x => 2**x.n));
    return fr;
  };
  const calcN = () => Math.round(Math.log2(fields.reduce((a, f) => a + 2 ** f.n, 0))); // round or floor?
  const [curN, setCurN] = useState<number>();
  useEffect(() => setCurN(fields.length ? calcN() : undefined), [fields]);

  const getCenter = (e: MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = (box.left + box.right) / 2;
    const y = (box.top + box.bottom) / 2;
    return {x, y};
  }
  const isSame = (a: fieldc, b: fieldc) =>
    a.row == b.row && a.col == b.col;
  const isNeighbor = (a: fieldc, b: fieldc) =>
    !isSame(a, b) &&
    Math.abs(a.row - b.row) <= 1 &&
    Math.abs(a.col - b.col) <= 1;
  const hasField = (field: fieldc) => fields.some(f => isSame(f, field));

  // https://marcgg.com/blog/2016/11/01/javascript-audio/
  const playSound = (n: number) => {
    if (waveform == 'none') return;
    const ctx = new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = waveform;
    o.frequency.value = 110*n;
    o.connect(g);
    g.connect(ctx.destination);
    o.start(0);
    g.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.4);
  };

  const Field = (o: fieldc) => {
    const text = 2 ** o.n;
    const down = (e: MouseEvent) => {
      console.log('down:', text, o);
      if (field) return;
      addField({ ...o, ...getCenter(e) });
    };
    const enter = (e: MouseEvent) => {
      if (!field) return;
      console.log('enter:', text, fields.map(x => 2 ** x.n), lines.length);
      if (isNeighbor(field, o) && (o.n == field.n || o.n == field.n + 1) && !hasField(o)) {
        const p = getCenter(e);
        addLine(line(field, p));
        addField({ ...o, ...p });
        playSound(o.n);
        console.log('added:', text);
      } else if (fields.length >= 2 && isSame(o, fields[fields.length-2])) {
        const f = popField();
        f && console.log('removed:', 2**f.n, 'at', text);
      }
    };
    const isCurrent = field && isSame(field, o);
    const isSelected = hasField(o);
    const classNames = ['Field', isCurrent && 'current', isSelected && 'selected'].filter(x => !!x).join(' ');
    let fontSize;
    const zoomText = true;
    if (zoomText) {
      const tl = text.toString().length;
      fontSize = tl == 1 ? '5rem' : tl == 2 ? '4rem' : '3rem';
    }
    return <button className={classNames} style={{ backgroundColor: color(o.n), fontSize }}
      onMouseDown={down} onMouseEnter={enter}> {text} </button>;
  };

  useEffect(() => console.log(matrix), [matrix]);
  // need to transpose matrix for display to match columns of values instead of rows of values
  const transpose = (m: number[][]) => m[0].map((_, i) => m.map(x => x[i]));
  const Fields = transpose(matrix).flatMap((row, irow) => row.map((n, icol) => <Field row={irow} col={icol} n={n} />));

  const move = (e: MouseEvent) => {
    // console.log('move:', e.clientX);
    // note that using useState would rerender and execute the enter above with every move...
    if (field) setLineRef(line(field, { x: e.clientX, y: e.clientY }));
  };
  const [stats, setStats] = useState({fields: 0, points: 0, start: Date.now()});
  const up = (e: MouseEvent) => {
    console.log('up:', fields);
    setLines([]);
    setField(undefined);
    if (fields.length < 2) return;
    for (const f of fields.slice(0, -1)) { // delete all but last field
      delete matrix[f.col][f.row]; // shouldn't mutate, but doesn't matter here
    }
    // last field gets the sum of all values
    const l = fields.slice(-1)[0];
    const points = matrix[l.col][l.row] = calcN();
    setMatrix(matrix.map(c => {
      const r = c.filter(n => n != undefined); // have to remove deleted values which are just undefined
      return Array(rows-r.length).fill(0).map(rand).concat(r); // prepend new random values in column
    }));
    // console.log(matrix);
    setStats({...stats, fields: stats.fields + fields.length, points: stats.points + points});
    setFields([]);
    setCurN(undefined);
  };

  return (
    <div className="App">
      {/* <h1>2248</h1> */}
      <Group position="center" className="config">
        <Group spacing={5}>
          <NumberInput w="4rem" min={2} value={cols} onChange={v => v && setCols(v)} />
          X
          <NumberInput w="4rem" min={2} value={rows} onChange={v => v && setRows(v)} />
        </Group>

        <NumberInput w="5rem" min={1} max={colors.length} value={colortheme} onChange={v => v && setColortheme(v)} icon={<IconColorFilter/>} />

        <Select
          // default ~ 14rem
          w="8.5rem"
          icon={<IconVolume />}
          data={waveforms}
          value={waveform}
          onChange={v => setWaveform(v as typeof waveforms[number])}
          />

        <ColorSchemeToggle />
      </Group>

      <div className="Fields" style={{gridTemplateColumns: 'auto '.repeat(cols)}} onMouseMove={move} onMouseUp={up}>
        {Fields}
      </div>

      <Group position="center" className="stats">
        {curN ? <>Result: <span className='stat'>{2**curN}</span></> :
        <>
          Duration: <span className='stat'>{duration(Date.now() - stats.start)}</span>
          <Divider orientation="vertical" />
          Cleared fields: <span className='stat'>{stats.fields}</span>
          <Divider orientation="vertical" />
          Points: <span className='stat'>{stats.points}</span>
        </>
        }
      </Group>

      <svg className="lines" width="100vw" height="100vh">
        {lines.map(o => <line {...o} />)}
        {field && <line ref={lineRef} />}
      </svg>
    </div>
  )
}
