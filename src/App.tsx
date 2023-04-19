import { Group, NumberInput, Select } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconColorFilter, IconVolume } from '@tabler/icons-react'; // https://tabler-icons-react.vercel.app/
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { ColorSchemeToggle } from './Mantine';
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
  const md = [
    [1, 1, 2, 10],
    [3, 2, 1, 1],
    [4, 5, 6, 7],
    [4, 2, 2, 8],
    [1, 1, 2, 9],
  ];
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const m = useMemo(() => Array(rows).fill(Array(cols).fill(1)).map(row => row.map(rand)), [rows, cols]) as number[][];

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

  const getCenter = (e: MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = (box.left + box.right) / 2;
    const y = (box.top + box.bottom) / 2;
    return {x, y};
  }
  const isNeighbor = (a: fieldc, b: fieldc) =>
    !(a.row == b.row && a.col == b.col) &&
    Math.abs(a.row - b.row) <= 1 &&
    Math.abs(a.col - b.col) <= 1;

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
      console.log('down:', text);
      setField({ ...o, ...getCenter(e) });
      // setLine({ x1, y1, x2: e.clientX, y2: e.clientY, stroke: color(o.n) });
    };
    const enter = (e: MouseEvent) => {
      if (!field) return;
      console.log('enter:', text, lines.length);
      if (isNeighbor(field, o) && (o.n == field.n || o.n == field.n + 1)) {
        const p = getCenter(e);
        addLine(line(field, p));
        console.log(line(field, p));
        setField({ ...o, ...p });
        playSound(o.n);
      }
    };
    const move = (e: MouseEvent) => {
      // console.log('move:', e.clientX);
      // note that using useState would rerender and execute the enter above with every move...
      if (field) setLineRef(line(field, { x: e.clientX, y: e.clientY }));
    };
    const leave = (e: MouseEvent) => {
      // console.log('leave:', text);
    };
    const up = (e: MouseEvent) => {
      // console.log('up:', text);
      setField(undefined);
      setLines([]);
    };
    return <button className="Field" style={{ backgroundColor: color(o.n) }}
      onMouseDown={down} onMouseEnter={enter} onMouseMove={move} onMouseLeave={leave} onMouseUp={up} > {text} </button>;
  };

  const fields = m.flatMap((row, irow) => row.map((n, icol) => <Field row={irow} col={icol} n={n} />));

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
      <div className="Fields" style={{gridTemplateColumns: 'auto '.repeat(cols)}}>
        {fields}
      </div>
      <svg className="lines" width="100vw" height="100vh">
        {lines.map(o => <line {...o} />)}
        {field && <line ref={lineRef} />}
      </svg>
    </div>
  )
}
