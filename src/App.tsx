import styles from './App.module.css';
import StylableCaretInput from './components/StylableCaretInput';

export default function App() {
  return (
    <div className={styles.wrapper}>
      <StylableCaretInput
        type="text"
        style={{
          border: '1px solid black',
          padding: '7px 5px 25px 5px',
          height: 250,
          fontSize: '18px',
          lineHeight: '35px',
        }}
      />
      <StylableCaretInput
        type="text"
        style={{
          border: '1px solid black',
          padding: '5px 7px',
          fontSize: '18px',
        }}
      />
      <StylableCaretInput
        type="text"
        style={{
          outline: '1px solid black',
          fontSize: '18px',
        }}
      />
    </div>
  );
}
