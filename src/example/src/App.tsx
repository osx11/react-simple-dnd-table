import {useState} from 'react';
import dragHandleIcon from './assets/drag-handle.svg';
import expandArrowIcon from './assets/expand-arrow.svg';
import {SimpleDNDTable, SimpleDNDTableData} from '@osx11/react-simple-dnd-table';

function App() {
  const [data, setData] = useState<SimpleDNDTableData[]>([
    {key: '1', values: ['1', '2', '3']},
    {
      key: '2',
      values: ['4', '5', '6'],
      inner: [
        {key: '4', values: ['10', '11', '12']},
        {key: '5', values: ['13', '14', '15']}
      ]
    },
    {key: '3', values: ['7', '8', '9']},
  ]);

  return (
    <SimpleDNDTable data={data} onOrderUpdate={setData} headers={['Column 1', 'Column 2', 'Column 3']} dragHandleIcon={dragHandleIcon} expandArrowIcon={expandArrowIcon}/>
  )
}

export default App;
