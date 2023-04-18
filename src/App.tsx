import { Group, NumberInput, Select } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';
import { IconColorFilter, IconVolume } from '@tabler/icons-react';
import { MouseEvent, useState } from 'react';
import { ColorSchemeToggle } from './Mantine';
import './App.css'

const colors = [
  // https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
  ["ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff", "a0c4ff", "bdb2ff", "ffc6ff", "fffffc"],
  // https://coolors.co/palette/eddcd2-fff1e6-fde2e4-fad2e1-c5dedd-dbe7e4-f0efeb-d6e2e9-bcd4e6-99c1de
  ["eddcd2", "fff1e6", "fde2e4", "fad2e1", "c5dedd", "dbe7e4", "f0efeb", "d6e2e9", "bcd4e6", "99c1de"],
  // https://coolors.co/palette/eae4e9-fff1e6-fde2e4-fad2e1-e2ece9-bee1e6-f0efeb-dfe7fd-cddafd
  ["eae4e9", "fff1e6", "fde2e4", "fad2e1", "e2ece9", "bee1e6", "f0efeb", "dfe7fd", "cddafd"],
];

export default function App() {
  // config
  // color palette
  const [colortheme, setColortheme] = useLocalStorage({ key: 'colortheme', defaultValue: 2 });
  const color = (n: number) => '#' + colors[colortheme % colors.length][n - 1];
  // sound
  const waveforms = ['none', 'sine', 'square', 'triangle', 'sawtooth'] as const;
  type waveform = typeof waveforms[number];
  const [waveform, setWaveform] = useLocalStorage<waveform>({ key: 'waveform', defaultValue: 'triangle' });

  // matrix of initial field values
  const m = [
    [1, 1, 2, 1],
    [3, 2, 1, 1],
    [4, 5, 6, 7],
    [4, 2, 2, 8],
    [1, 1, 2, 9],
  ];
  const [rows, setRows] = useState(m.length);
  const [cols, setCols] = useState(m[0].length);

  // state and lines between fields when drawing
  type field = { row: number, col: number, n: number };
  const [field, setField] = useState<field>();
  type line = { x1: number, y1: number, x2: number, y2: number; stroke: string };
  // current line when moving mouse
  const [line, setLine] = useState<line>();
  // already established lines between matching fields
  const [lines, setLines] = useState<line[]>([]);
  const addLine = (line: line) => setLines([...lines, line]);

  const getCenter = (e: MouseEvent) => {
    const box = e.currentTarget.getBoundingClientRect();
    const x = (box.left + box.right) / 2;
    const y = (box.top + box.bottom) / 2;
    return [x, y];
  }
  const isNeighbor = (a: field, b: field) =>
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

  const Field = (o: field) => {
    const text = 2 ** o.n;
    const down = (e: MouseEvent) => {
      console.log('down:', text);
      setField(o);
      const [x1, y1] = getCenter(e);
      setLine({ x1, y1, x2: e.clientX, y2: e.clientY, stroke: color(o.n) });
    };
    const enter = (e: MouseEvent) => {
      if (!field || !line) return;
      console.log('enter:', text, lines.length);
      if (isNeighbor(field, o) && (o.n == field.n || o.n == field.n + 1)) {
        setField(o);
        const [x, y] = getCenter(e);
        addLine({ ...line, x2: x, y2: y });
        console.log(line);
        setLine({ ...line, x1: x, y1: y, stroke: color(o.n) });
        playSound(o.n);
      }
    };
    const move = (e: MouseEvent) => {
      // console.log('move:', e.clientX);
      // this will rerender and call enter with every move...
      // if (line) setLine({...line, x2: e.clientX, y2: e.clientY});
    };
    const leave = (e: MouseEvent) => {
      // console.log('leave:', text);
    };
    const up = (e: MouseEvent) => {
      // console.log('up:', text);
      setLine(undefined);
    };
    return <button className="Field" style={{ backgroundColor: color(o.n) }}
      onMouseDown={down} onMouseEnter={enter} onMouseMove={move} onMouseLeave={leave} onMouseUp={up} > {text} </button>;
  };

  const fields = m.flatMap((row, irow) => row.map((n, icol) => <Field row={irow} col={icol} n={n} />));

  return (
    <div className="App">
      <h1>2248</h1>
      <Group position="center" className="config">
        <NumberInput w="4rem" min={2} value={cols} onChange={v => v && setCols(v)} />
        x
        <NumberInput w="4rem" min={2} value={rows} onChange={v => v && setRows(v)} />

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
        {/* {line && <line {...line} /> } */}
      </svg>
    </div>
  )
}
