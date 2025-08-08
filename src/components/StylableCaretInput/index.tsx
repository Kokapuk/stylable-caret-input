import {
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type DetailedHTMLProps,
  type InputHTMLAttributes,
} from 'react';
import styles from './StylableCaretInput.module.css';

type NativeProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

export type StylableCaretInputProps = Omit<NativeProps, 'type'> & {
  type: Extract<NativeProps['type'], 'text' | 'search' | 'url' | 'tel' | 'password'>;
  caretClass?: string;
  caretStyle?: CSSProperties;
  caretOffset?: { x?: string; y?: string };
};

const EVENT_TRIGGER_PROPS = [
  'onClick',
  'onFocus',
  'onKeyDown',
  'onSelect',
  'onScroll',
  'onBlur',
] as const satisfies readonly (keyof NativeProps)[];

export default function StylableCaretInput({
  caretClass,
  caretStyle,
  caretOffset,
  className,
  style,
  ref,
  ...props
}: StylableCaretInputProps) {
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

    if (
      document.activeElement !== input.current ||
      input.current.selectionStart !== input.current.selectionEnd ||
      !document.hasFocus()
    ) {
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
    measurementField.current.textContent = input.current.value.slice(0, input.current.selectionStart ?? 0);

    const measurementFieldRect = measurementField.current.getBoundingClientRect();
    const caretRect = caret.current.getBoundingClientRect();
    const wrapperRect = wrapper.current.getBoundingClientRect();

    caret.current.style.transform = `
        translateX(calc(
          ${wrapperComputedStyle.getPropertyValue('padding-left')} + 
          ${wrapperComputedStyle.getPropertyValue('border-left-width')} +
          ${measurementFieldRect.width}px -
          ${input.current.scrollLeft}px -
          ${caretRect.width / 2}px + 
          ${caretOffset?.x ?? '0px'}
        ))
        translateY(calc(
          ${wrapperComputedStyle.getPropertyValue('padding-top')} + 
          ${wrapperComputedStyle.getPropertyValue('border-top-width')} +
          ((${wrapperRect.height}px - 
            ${wrapperComputedStyle.getPropertyValue('padding-top')} - 
            ${wrapperComputedStyle.getPropertyValue('border-top-width')} -
            ${wrapperComputedStyle.getPropertyValue('padding-bottom')} - 
            ${wrapperComputedStyle.getPropertyValue('border-bottom-width')}
          ) / 2 - ${caretRect.height / 2}px) +
          ${caretOffset?.y ?? '0px'}
        ))`;

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
    <div
      ref={wrapper}
      className={[styles.wrapper, className].filter(Boolean).join(' ')}
      onClick={() => input.current?.focus()}
      style={style}
    >
      <input ref={input} {...props} {...getUpdateTriggers()} />
      <div ref={caret} className={[styles.caret, caretClass].filter(Boolean).join(' ')} style={caretStyle} inert />
      <pre ref={measurementField} className={styles.measurementField} />
    </div>
  );
}
