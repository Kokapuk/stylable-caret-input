import { useImperativeHandle, useRef, type DetailedHTMLProps, type InputHTMLAttributes } from 'react';
import styles from './StylableCaretInput.module.css';

type NativeProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const EVENT_TRIGGER_PROPS = [
  'onClick',
  'onKeyDown',
  'onSelect',
  'onScroll',
  'onBlur',
] as const satisfies readonly (keyof NativeProps)[];

export default function StylableCaretInput({ className, style, ref, ...props }: NativeProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const measurementField = useRef<HTMLPreElement>(null);
  const caret = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => input.current!, []);
  const tickUpdated = useRef(false);

  const updateCaret = () => {
    if (!input.current || !measurementField.current || !wrapper.current || !caret.current) {
      return;
    }

    if (document.activeElement !== input.current || input.current.selectionStart !== input.current.selectionEnd) {
      caret.current.style.visibility = 'hidden';

      caret.current.getAnimations().forEach((animation) => {
        animation.currentTime = 0;
        animation.pause();
      });

      return;
    } else {
      caret.current.style.visibility = 'visible';
    }

    const wrapperComputedStyle = window.getComputedStyle(wrapper.current);

    measurementField.current.textContent = input.current.value.toString().slice(0, input.current.selectionStart ?? 0);
    const measurementFieldRect = measurementField.current.getBoundingClientRect();
    const caretRect = caret.current.getBoundingClientRect();

    caret.current.style.transform = `
        translateX(calc(
          ${wrapperComputedStyle.getPropertyValue('padding-left')} + 
          ${wrapperComputedStyle.getPropertyValue('border-left-width')} +
          ${measurementFieldRect.width}px -
          ${input.current.scrollLeft}px -
          ${caretRect.width}px
        ))
        translateY(calc(
          ${wrapperComputedStyle.getPropertyValue('padding-top')} + 
          ${wrapperComputedStyle.getPropertyValue('border-top-width')}))`;

    caret.current.getAnimations().forEach((animation) => {
      animation.currentTime = 0;
      animation.play();
    });
  };

  const scheduleUpdateCaret = () => {
    if (!tickUpdated.current) {
      tickUpdated.current = true;

      requestAnimationFrame(() => {
        updateCaret();
        tickUpdated.current = false;
      });
    }
  };

  const getUpdateTriggers = () => {
    const triggerProps: { [K in (typeof EVENT_TRIGGER_PROPS)[number]]?: NativeProps[K] } = {};

    for (const prop of EVENT_TRIGGER_PROPS) {
      triggerProps[prop] = (...args: Parameters<Exclude<NativeProps[typeof prop], undefined>>) => {
        scheduleUpdateCaret();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (props[prop] as any)?.(...args);
      };
    }

    return triggerProps;
  };

  return (
    <div ref={wrapper} className={[styles.wrapper, className].filter(Boolean).join(' ')} style={style}>
      <input ref={input} {...props} {...getUpdateTriggers()} />
      <div ref={caret} className={styles.caret} inert />
      <pre ref={measurementField} className={styles.measurementField}>
        {/* {internalValue.toString().slice(0, selectionStart)} */}
      </pre>
    </div>
  );
}
