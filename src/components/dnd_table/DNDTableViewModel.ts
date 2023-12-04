import { makeAutoObservable } from 'mobx';
import { MutableRefObject } from 'react';
import {BaseEvent} from '../../api/BaseEvent';

type RefType = MutableRefObject<HTMLDivElement | null>;

export class DNDTableViewModel {
  constructor() {
    makeAutoObservable(this);
  }

  private draggingElementRealRef: HTMLDivElement | null = null;
  private draggingElementShadowRef: HTMLDivElement | null = null;
  private _isDragging = false;
  public readonly onDataUpdateEvent = new BaseEvent<{ fromIndex: number; toIndex: number }>();

  setIsDragging(isDragging: boolean) {
    this._isDragging = isDragging;
  }

  get isDragging() {
    return this._isDragging;
  }

  getTableRowsOnly(containerRef: RefType) {
    if (!containerRef.current) return [];

    return Array.from(containerRef.current!.children).filter((c) =>
      (c as HTMLDivElement).className.includes('dnd__table-row'),
    )!;
  }

  getNearestElementToShadow(mousePosition: number, containerRef: RefType): { index: number; insertAfter: boolean } {
    let index = -1;
    let insertAfter = false;

    this.getTableRowsOnly(containerRef).forEach((c, i) => {
      if (c === this.draggingElementRealRef || c === this.draggingElementShadowRef) return;

      if (Math.abs(c.getBoundingClientRect().y + c.getBoundingClientRect().height - mousePosition) < 15) {
        index = i;
        insertAfter = true;
        return;
      } else if (Math.abs(c.getBoundingClientRect().y - mousePosition) < 15 && i === 0) {
        index = i;
        insertAfter = false;
        return;
      }
    });

    return { index, insertAfter };
  }

  onMouseDown(e: MouseEvent, containerRef: RefType) {
    if ((e.target as HTMLDivElement).className.includes('dnd__handle-disabled')) return;

    const row = (e.target as HTMLDivElement).parentElement!.parentElement! as HTMLDivElement;
    this._isDragging = true;

    this.draggingElementShadowRef = row.cloneNode(true) as HTMLDivElement;
    this.draggingElementRealRef = row;

    const width = row.getBoundingClientRect().width;
    this.draggingElementShadowRef!.style.background = window.getComputedStyle(row).background;
    this.draggingElementShadowRef!.style.width = `${width}px`;
    this.draggingElementShadowRef!.style.position = 'absolute';
    this.draggingElementShadowRef!.style.top = `${e.clientY - 30}px`;
    this.draggingElementShadowRef!.style.opacity = `0.3`;

    row.style.opacity = '0';

    containerRef.current!.append(this.draggingElementShadowRef);
  }

  onMouseMove(e: MouseEvent, containerRef: RefType) {
    const containerY = containerRef.current!.getBoundingClientRect().y;
    const containerHeight = containerRef.current!.getBoundingClientRect().height;

    const isAbove = e.clientY < containerY || e.clientY < 15;
    const isBelow = e.clientY > containerY + containerHeight || Math.abs(e.clientY - window.innerHeight) < 15;

    if (!isAbove && !isBelow) {
      this.draggingElementShadowRef!.style.top = `${e.clientY - 30}px`;
    }

    if (isBelow) {
      containerRef.current!.scrollTop += 10;
    }

    if (isAbove) {
      containerRef.current!.scrollTop -= 10;
    }

    this.getTableRowsOnly(containerRef)
      .filter((c) => c !== this.draggingElementRealRef && c !== this.draggingElementShadowRef)
      .map((c) => c as HTMLDivElement)
      .forEach((c, i) => {
        if (Math.abs(c.getBoundingClientRect().y + c.getBoundingClientRect().height - e.clientY) < 15) {
          c.style.borderBottom = '2px var(--dnd-table-row-highlight-border) solid';
        } else if (Math.abs(c.getBoundingClientRect().y - e.clientY) < 15 && i === 0) {
          c.style.borderTop = '2px var(--dnd-table-row-highlight-border) solid';
        } else {
          c.style.borderBottom = 'none';
          c.style.borderTop = 'none';
        }
      });
  }

  onMouseUp(e: MouseEvent, containerRef: RefType) {
    const nearest = this.getNearestElementToShadow(e.clientY, containerRef);

    if (nearest.index !== -1) {
      const fromIndex = this.getTableRowsOnly(containerRef).findIndex((c) => c === this.draggingElementRealRef);
      let toIndex = nearest.index;
      const insertAfter = nearest.insertAfter;

      // important thing:
      // if moving from bottom to top, we should increment the toIndex
      // if inserting BEFORE element, we should increment it as well
      // otherwise, leave the index as is
      toIndex = insertAfter && fromIndex > toIndex ? toIndex + 1 : toIndex;

      this.onDataUpdateEvent.emit({ fromIndex, toIndex });
    }

    this.setIsDragging(false);

    this.draggingElementRealRef!.style.opacity = '1';

    containerRef.current!.removeChild(this.draggingElementShadowRef!);

    this.draggingElementShadowRef = null;
    this.draggingElementRealRef = null;

    Array.from(containerRef.current!.children).forEach((c) => {
      (c as HTMLDivElement).style.borderBottom = 'none';
      (c as HTMLDivElement).style.borderTop = 'none';
    });
  }

  onChildrenUpdate(containerRef: RefType) {
    const tableRows = Array.from(containerRef.current!.children);
    let index = 0;

    const isInner = (containerRef.current!.parentNode as HTMLDivElement).className.includes('inner');

    if (isInner) return;

    // update rows background
    tableRows.forEach((tr) => {
      if (tr.className.includes('dnd__table-head')) return;

      const innerContainer = tr.getElementsByClassName('inner')?.[0];
      const innerElements = innerContainer ? Array.from(innerContainer?.children?.[0].children) : undefined;

      if (index % 2 === 0) {
        (tr.children[0] as HTMLDivElement).style.background = 'var(--dnd-table-odd-row-background)';
      } else {
        (tr.children[0] as HTMLDivElement).style.background = 'var(--dnd-table-even-row-background)';
      }

      if (innerElements && innerElements.length > 0) {
        innerElements.forEach((itr) => {
          if ((index + 1) % 2 === 0) {
            (itr as HTMLDivElement).style.background = 'var(--dnd-table-odd-row-background)';
          } else {
            (itr as HTMLDivElement).style.background = 'var(--dnd-table-even-row-background)';
          }

          index += 1;
        });
      }

      index += 1;
    });
  }
}
