import styles from './App.module.css';
import StylableCaretInput from './components/StylableCaretInput';

export default function App() {
  return (
    <div className={styles.wrapper}>
      <StylableCaretInput />
    </div>
  );
}
