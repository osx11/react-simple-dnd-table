import {useState} from 'react';
import dragHandleIcon from './assets/drag-handle.svg';
import expandArrowIcon from './assets/expand-arrow.svg';
import {SimpleDNDTable, SimpleDNDTableData} from '@osx11/react-simple-dnd-table';
import styled from 'styled-components';
import {v4 as uuid} from 'uuid';

function App() {
  const [data, setData] = useState<SimpleDNDTableData[]>([
    {key: uuid(), values: ['1', '2', '3']},
    {
      key: uuid(),
      values: ['4', '5', '6'],
      inner: [
        {key: uuid(), values: ['10', '11', '12']},
        {key: uuid(), values: ['13', '14', '15']}
      ]
    },
    {key: uuid(), values: ['7', '8', '9']},
  ]);

  const addRandomData = () => {
    const rand = () => Number((Math.random() * 100).toFixed());
    setData(v => [...v, {key: uuid(), values: [String(rand()), String(rand()), String(rand())]}])
  }

  return (
    <Layout>
      <Container>
        <ButtonContainer>
          <button onClick={addRandomData}>Add random data</button>
        </ButtonContainer>

        <SimpleDNDTable
          data={data}
          onOrderUpdate={setData}
          headers={['Column 1', 'Column 2', 'Column 3']}
          dragHandleIcon={dragHandleIcon} expandArrowIcon={expandArrowIcon}
        />
      </Container>
    </Layout>
  )
}

export default App;

const Layout = styled.div `
  padding: 10px;
  display: flex;
  justify-content: center;
`;

const Container = styled.div `
  width: 1000px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ButtonContainer = styled.div `
  display: flex;
  justify-content: center;

  button {
    padding: 10px;
    font-size: 1rem;
    cursor: pointer;

    outline: none;
    border: none;
    background: #6b95ff;
    color: #fff;
    border-radius: 5px;
  }
`;



