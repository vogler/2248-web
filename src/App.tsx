import './App.css'

export default function App() {
  const m = [
    [1, 1, 2, 1],
    [3, 2, 1, 1],
    [2, 5, 6, 8],
    [4, 2, 2, 1],
    [1, 1, 2, 7],
  ];
  const rows = m.length;
  const cols = m[0].length;
  const fields = m.flatMap(row => row.map(col => <Field exp={col}/>));

  return (
    <div className="App">
      <h1>2248</h1>
      <div className="Fields" style={{gridTemplateColumns: 'auto '.repeat(cols)}}>
        {fields}
      </div>
    </div>
  )
}

const colors = [
  // https://coolors.co/palette/ffadad-ffd6a5-fdffb6-caffbf-9bf6ff-a0c4ff-bdb2ff-ffc6ff-fffffc
  ["ffadad", "ffd6a5", "fdffb6", "caffbf", "9bf6ff", "a0c4ff", "bdb2ff", "ffc6ff", "fffffc"],
  // https://coolors.co/palette/eddcd2-fff1e6-fde2e4-fad2e1-c5dedd-dbe7e4-f0efeb-d6e2e9-bcd4e6-99c1de
  ["eddcd2", "fff1e6", "fde2e4", "fad2e1", "c5dedd", "dbe7e4", "f0efeb", "d6e2e9", "bcd4e6", "99c1de"],
  // https://coolors.co/palette/eae4e9-fff1e6-fde2e4-fad2e1-e2ece9-bee1e6-f0efeb-dfe7fd-cddafd
  ["eae4e9", "fff1e6", "fde2e4", "fad2e1", "e2ece9", "bee1e6", "f0efeb", "dfe7fd", "cddafd"],
];
const color = colors[2];

const Field = ({ exp = 1}) => {
  const text = 2**exp;
  return <button className="Field" style={{backgroundColor: '#'+color[exp-1]}}>{text}</button>;
};
