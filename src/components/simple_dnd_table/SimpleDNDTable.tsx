import styled, {css} from 'styled-components';
import DND from '../dnd_table';
import DNDHandle from '../dnd_table_handle';
import * as React from 'react';

export type SimpleDNDTableData = {
  key: number | string;
  values: string[];
  inner?: SimpleDNDTableData[];
}

type SimpleDNDTableProps = {
  data: SimpleDNDTableData[];
  onOrderUpdate: (data: SimpleDNDTableData[]) => void;
  headers: string[];
  dragHandleIcon: string;
  expandArrowIcon: string;
  gridColumnSettings?: string;
}

const SimpleDNDTable = ({ data, onOrderUpdate, gridColumnSettings, dragHandleIcon, expandArrowIcon, headers }: SimpleDNDTableProps) => {
  const [expandedItems, setExpandedItems] = React.useState<(number | string)[]>([]);

  function moveArrayElement<T>(array: T[], fromIndex: number, toIndex: number) {
    if (fromIndex < 0 || fromIndex >= array.length || toIndex < 0 || toIndex >= array.length || fromIndex === toIndex) {
      return array;
    }

    const elementToMove = array.splice(fromIndex, 1)[0];
    array.splice(toIndex, 0, elementToMove);

    return array;
  }

  const updateOrder = (iFrom: number, iTo: number) => {
    return moveArrayElement([...data], iFrom, iTo);
  }

  const updateExpandedItem = (key: number | string) => {
    const newItems = [...expandedItems];

    if (expandedItems.includes(key)) {
      newItems.splice(newItems.indexOf(key), 1);
    } else {
      newItems.push(key);
    }

    setExpandedItems(newItems);
  }

  const updateInnerOrder = (baseKey: number | string, iFrom: number, iTo: number) => {
    const baseIndex = data.findIndex(d => d.key === baseKey);

    if (baseIndex === -1) return data;

    const base = data[baseIndex];

    if (!base.inner) return data;

    base.inner = moveArrayElement([...base.inner], iFrom, iTo)
    const newData = [...data]
    newData[baseIndex] = base;

    return newData;
  }

  const computedGridColumnSettings = React.useMemo(() => {
    if (gridColumnSettings) return gridColumnSettings;

    let grid = '30px'

    for (let i = 0; i < headers.length; i++) {
      grid += ' 1fr'
    }

    return grid;
  }, [data, gridColumnSettings])

  return (
    <Layout>
      <DND.Table
        onOrderUpdate={(iFrom, iTo) => onOrderUpdate(updateOrder(iFrom, iTo))}
        gridColumnSettings={computedGridColumnSettings}
      >
        <DND.TableHead>
          <DND.TableHeader>
            {headers.map((h, i) => (
              <DND.TableHeaderElement key={i}>{h}</DND.TableHeaderElement>
            ))}
          </DND.TableHeader>
        </DND.TableHead>

        {data.map((row) => (
          <DND.TableRow key={row.key}>
            <DND.TableData>
              <DNDHandle url={dragHandleIcon}/>

              {row.values.map((col, j) => (
                <DND.TableDataElement key={j}>
                  {row.inner && j === 0 &&
                    <ExpandArrow src={expandArrowIcon} $expanded={expandedItems.includes(row.key)} onClick={() => updateExpandedItem(row.key)}/>
                  }
                  {col}
                </DND.TableDataElement>
              ))}
            </DND.TableData>

            {row.inner &&
              <DND.TableData className={'inner'}>
                <DND.Table
                  onOrderUpdate={(iFrom, iTo) => onOrderUpdate(updateInnerOrder(row.key, iFrom, iTo))}
                  gridColumnSettings={computedGridColumnSettings}
                >
                  {row.inner?.map((inner) => (
                    <ExpandableTableRow key={inner.key} $expanded={expandedItems.includes(row.key)}>
                      <DND.TableData>
                        <DNDHandle url={dragHandleIcon}/>

                        {inner.values.map((col, j) => (
                          <DND.TableDataElement key={j}>{col}</DND.TableDataElement>
                        ))}
                      </DND.TableData>
                    </ExpandableTableRow>
                  ))}
                </DND.Table>
              </DND.TableData>
            }
          </DND.TableRow>
        ))}
      </DND.Table>
    </Layout>
  )
}

const Layout = styled.div ``;

const ExpandArrow = styled.img<{ $expanded: boolean }> `
  cursor: pointer;
  transition: transform 0.2s ease-in;
  transform: rotate(-90deg)
  
  ${({$expanded}) => $expanded && css `
    transform: rotate(180deg)
  `}
`;


const ExpandableTableRow = styled(DND.TableRow)<{ $expanded: boolean }> `
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.5s cubic-bezier(0, 1, 0, 1); // hack for delay solution

  ${({ $expanded }) => $expanded && css`
      max-height: 100vh;
      transition: max-height 1s ease-in-out;
    `}
`;

export default SimpleDNDTable;
