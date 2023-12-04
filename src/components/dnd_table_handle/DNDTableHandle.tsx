import styled from 'styled-components';
import DND from '../dnd_table';
import * as React from 'react';

type DNDHandleProps = {
  url: string;
  disabled?: boolean;
};

const DNDHandle = ({ url, disabled }: DNDHandleProps) => {
  return (
    <HandleContainer $disabled={disabled} className={'dnd__handle' + (disabled ? ' dnd__handle-disabled' : '')}>
      <Handle $url={url} />
    </HandleContainer>
  );
};

const HandleContainer = styled(DND.TableDataElement)<{ $disabled?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: ${({ $disabled }) => ($disabled ? 0.3 : 1)};

  .inner & + ${DND.TableDataElement} {
    padding-left: 30px;
  }
`;

const Handle = styled.div<{ $url: string }>`
  background: ${({ $url }) => `url(${$url})`};
  width: 24px;
  height: 24px;
`;

export default DNDHandle;
