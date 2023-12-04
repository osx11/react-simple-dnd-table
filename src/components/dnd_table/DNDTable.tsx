import {observer, useLocalObservable} from 'mobx-react';
import {DNDTableViewModel} from './DNDTableViewModel';
import styled, {css} from 'styled-components';
import * as React from 'react';

type DNDTableProps = {
  children: React.ReactNode;
  onOrderUpdate: (originalIndex: number, movedToIndex: number) => void;
  gridColumnSettings?: string;
  maxHeight?: string;
};

const Table = observer(
  React.forwardRef<HTMLDivElement | null, DNDTableProps>((props: DNDTableProps, ref) => {
    const { children, onOrderUpdate, gridColumnSettings, maxHeight } = props;

    const fallbackRef = React.useRef<HTMLDivElement | null>(null);
    const containerRef = (ref || fallbackRef) as React.MutableRefObject<HTMLDivElement | null>;

    const viewModel = useLocalObservable(() => new DNDTableViewModel());

    const onMouseDown = (e: MouseEvent) => {
      viewModel.onMouseDown(e, containerRef);
    };

    const onMouseMove = (e: MouseEvent) => {
      viewModel.onMouseMove(e, containerRef);
    };

    const onMouseUp = (e: MouseEvent) => {
      viewModel.onMouseUp(e, containerRef);
    };

    React.useEffect(() => {
      const subscription = viewModel.onDataUpdateEvent.addEventListener((e) => {
        onOrderUpdate(e.fromIndex, e.toIndex);
      });

      return () => subscription.unsubscribe();
    }, [children, onOrderUpdate, viewModel.onDataUpdateEvent]);

    React.useEffect(() => {
      const tableRows = Array.from(containerRef.current!.children);
      const handles = tableRows
        .map((c) => Array.from(c.children[0].children)[0])
        .filter((e) => (e as HTMLDivElement).className.includes('dnd__handle'));

      handles.forEach((o) => {
        (o as HTMLDivElement).addEventListener('mousedown', onMouseDown);
      });

      viewModel.onChildrenUpdate(containerRef);

      return () => {
        handles.forEach((o) => {
          (o as HTMLDivElement).removeEventListener('mousedown', onMouseDown);
        });
      };
    }, [children]);

    React.useEffect(() => {
      if (!viewModel.isDragging) return;

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    }, [viewModel.isDragging, children]);

    return (
      <TableContainer ref={containerRef} $maxheight={maxHeight} $gridcolumnsettings={gridColumnSettings}>
        {children}
      </TableContainer>
    );
  }),
);

const tableDataElementStyles = css`
  padding: 12px 10px;
  border-right: 1px var(--dnd-table-borders) solid;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  word-break: break-all;
  gap: 10px;

  &.dnd__handle {
    border-right: none;
    padding: 5px;
  }

  &:last-child {
    border-right: none;
  }
`;

const tableDataStyles = css`
  display: grid;
  grid-template-columns: 60px 1fr;
  grid-template-rows: 1fr;
  width: 100%;
  grid-gap: 0;

  &.inner {
    display: flex;
  }
`;

const TableDataElement = styled.div.attrs({ className: 'dnd__table-data-element' })`
  ${tableDataElementStyles};

  &.dnd__handle {
    padding: 0;
  }
`;

const TableData = styled.div.attrs({ className: 'dnd__table-data' })`
  ${tableDataStyles}

  .dnd__handle + ${TableDataElement} {
    padding-left: 0;
  }
`;

const tableRowStyles = css`
  ${TableData} {
    border-bottom: 1px var(--dnd-table-borders) solid;
  }
`;

const TableRow = styled.div.attrs({ className: 'dnd__table-row' })`
  ${tableRowStyles};
`;

const TableHead = styled.div.attrs({ className: 'dnd__table-head' })`
  ${tableRowStyles};
  background: #fff;
  width: 100%;
  z-index: 999;
`;

const TableHeaderElement = styled.div.attrs({ className: 'dnd__table-header-element' })`
  ${tableDataElementStyles};
  font-weight: 500;
`;

const TableHeader = styled.div.attrs({ className: 'dnd__table-header' })`
  ${tableDataStyles}

  ${TableHeaderElement}:first-child {
    grid-column: span 2;
  }
`;

const TableContainer = styled.div.attrs({ className: 'dnd__table' })<{
  $gridcolumnsettings?: string;
  $maxheight?: string;
}>`
  flex: 1;
  max-height: ${({ $maxheight }) => $maxheight};
  overflow: auto;
  overflow-x: hidden;
  border: 1px var(--dnd-table-borders) solid;
  border-left: none;
  border-right: none;

  ${TableData}, ${TableHeader} {
    grid-template-columns: ${({ $gridcolumnsettings }) => $gridcolumnsettings || '60px 1fr'};
  }

  .inner {
    ${TableData}, ${TableHeader} {
      grid-template-columns: ${({ $gridcolumnsettings }) => $gridcolumnsettings || '60px 1fr'};
    }

    & > div {
      border: none;
    }

    ${TableRow}:last-child ${TableData} {
      border-bottom: none;
    }
  }

  * {
    user-select: none;
  }

  .dnd__handle {
    cursor: grab;

    * {
      pointer-events: none;
    }
  }
`;

const DND = {
  Table,
  TableData,
  TableDataElement,
  TableRow,
  TableHead,
  TableHeader,
  TableHeaderElement,
};

export default DND;
