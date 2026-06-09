import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { toast } from "react-toastify";
import { CameraIcon, PlusCircleIcon } from "@heroicons/react/24/solid";

export const EXPENSE_CATEGORIES = [
  ['food', ['🍔', 'Food & Dining']],
  ['transport', ['🚗', 'Transportation']],
  ['housing', ['🏠', 'Housing & Rent']],
  ['utilities', ['⚡', 'Utilities']],
  ['healthcare', ['⚕️', 'Healthcare']],
  ['entertainment', ['🎬', 'Entertainment']],
  ['shopping', ['🛍️', 'Shopping']],
  ['education', ['📚', 'Education']],
  ['personal', ['💅', 'Personal Care']],
  ['travel', ['✈️', 'Travel']],
  ['other', ['📦', 'Other']],
];

export const getExpenseCategoryMeta = (category) => {
  const value = typeof category === "string" && category.trim() ? category.trim() : "other";
  const categoryData = EXPENSE_CATEGORIES.find(([key]) => key === value);

  if (categoryData) {
    return {
      icon: categoryData[1][0],
      label: categoryData[1][1],
      value,
    };
  }

  return {
    icon: "📦",
    label: value
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    value,
  };
};

const TESSERACT_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js";

const loadTesseract = () => new Promise((resolve, reject) => {
  if (window.Tesseract) {
    resolve(window.Tesseract);
    return;
  }

  const existingScript = document.querySelector(`script[src="${TESSERACT_CDN}"]`);
  if (existingScript) {
    existingScript.addEventListener("load", () => resolve(window.Tesseract), { once: true });
    existingScript.addEventListener("error", reject, { once: true });
    return;
  }

  const script = document.createElement("script");
  script.src = TESSERACT_CDN;
  script.async = true;
  script.onload = () => resolve(window.Tesseract);
  script.onerror = reject;
  document.head.appendChild(script);
});

const AddExpenseForm = ({ budgets }) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const formRef = useRef();
  const focusRef = useRef();
  const amountRef = useRef();
  const categoryRef = useRef();
  const budgetRef = useRef();
  const receiptInputRef = useRef();

  useEffect(() => {
    if (!isSubmitting && !isScanningReceipt && formRef.current && focusRef.current) {
      formRef.current.reset();
      focusRef.current.focus();
    }
  }, [isSubmitting, isScanningReceipt]);

  const parseReceiptText = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    const amountPattern = /(?:rs\.?|npr|रू|रु|रुपैयाँ|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
    const totalKeywords = /(grand\s*)?total|amount\s*due|balance|net\s*amount|cash|paid/i;
    const noisyAmountLine = /invoice|bill\s*no|phone|tel|vat|pan|date|time|qty|quantity/i;

    const candidates = [];
    lines.forEach((line, index) => {
      const matches = [...line.matchAll(amountPattern)];
      matches.forEach((match) => {
        const value = Number(match[1].replace(/,/g, ""));
        if (!Number.isFinite(value) || value <= 0 || value > 10000000) return;
        candidates.push({
          value,
          score: (totalKeywords.test(line) ? 100 : 0) - (noisyAmountLine.test(line) ? 40 : 0) + index / 100,
        });
      });
    });

    const amount = candidates
      .sort((a, b) => b.score - a.score || b.value - a.value)[0]?.value;

    const merchant = lines.find((line) => (
      /[a-z]/i.test(line)
      && !totalKeywords.test(line)
      && !noisyAmountLine.test(line)
      && line.length >= 3
      && line.length <= 48
    ));

    const lowerText = text.toLowerCase();
    const category = [
      [/restaurant|cafe|coffee|food|pizza|burger|bakery|grocery|mart|store|supermarket/, "food"],
      [/taxi|bus|fuel|petrol|parking|transport|uber|pathao/, "transport"],
      [/rent|apartment|house|housing/, "housing"],
      [/electric|water|internet|wifi|utility|utilities/, "utilities"],
      [/hospital|clinic|pharmacy|medicine|health/, "healthcare"],
      [/movie|cinema|game|music|entertainment/, "entertainment"],
      [/school|college|book|tuition|education/, "education"],
      [/hotel|flight|travel|airlines/, "travel"],
      [/salon|beauty|personal/, "personal"],
      [/shop|mall|clothes|fashion|shopping/, "shopping"],
    ].find(([pattern]) => pattern.test(lowerText))?.[1] || "other";

    return {
      amount,
      name: merchant || "Receipt expense",
      category,
    };
  };

  const handleReceiptCapture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!budgets.length) {
      toast.error("Create a budget before scanning a receipt.");
      event.target.value = "";
      return;
    }

    setIsScanningReceipt(true);
    setScanStatus("Reading receipt...");

    try {
      const Tesseract = await loadTesseract();
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (message) => {
          if (message.status === "recognizing text") {
            setScanStatus(`Reading receipt ${Math.round((message.progress || 0) * 100)}%`);
          }
        },
      });

      const parsed = parseReceiptText(data.text || "");
      if (!parsed.amount) {
        toast.error("I could not find a total amount on that receipt.");
        return;
      }

      if (focusRef.current) focusRef.current.value = parsed.name;
      if (amountRef.current) amountRef.current.value = Math.round(parsed.amount);
      if (categoryRef.current) categoryRef.current.value = parsed.category;
      if (budgetRef.current && !budgetRef.current.value) {
        budgetRef.current.value = budgets[0].id || budgets[0]._id;
      }

      toast.success(`Receipt read: Rs. ${Math.round(parsed.amount).toLocaleString()}. Review and tap Add Expense.`);
    } catch (err) {
      console.error("Receipt scan failed:", err);
      toast.error("Could not read the receipt. Try a clearer photo.");
    } finally {
      setIsScanningReceipt(false);
      setScanStatus("");
      event.target.value = "";
    }
  };

  return (
    <div className="form-wrapper">
      <h2 className="h3">
        Add {""}
        <span className="accent">
          <i>{budgets.length === 1 && `${budgets.map((budg) => budg.name)}`}</i>
        </span>{" "}
        Expense
      </h2>
      <fetcher.Form method="post" className="grid-sm" ref={formRef}>
        <div className="expense-inputs">
          <div className="grid-xs">
            <label htmlFor="newExpense">Expense Name</label>
            <input
              type="text"
              name="newExpense"
              id="newExpense"
              placeholder="e.g., Sofa"
              ref={focusRef}
              required
            />
          </div>
          <div className="expense-inputab">
            <div className="grid-xs">
              <label htmlFor="newExpenseAmount">Amount</label>
              <input
                type="number"
                step="1"
                inputMode="decimal"
                name="newExpenseAmount"
                id="newExpenseAmount"
                placeholder="e.g., Rs. 9000"
                ref={amountRef}
                required
              />
            </div>
            <div className="grid-xs">
              <label htmlFor="newExpenseCategory">Type</label>
              <input
                type="text"
                name="category"
                id="newExpenseCategory"
                list="expenseCategoryOptions"
                placeholder="e.g., food or college fees"
                defaultValue="other"
                ref={categoryRef}
                maxLength={40}
                required
              />
              <datalist id="expenseCategoryOptions">
                {EXPENSE_CATEGORIES.map(([key, [icon, label]]) => (
                  <option key={key} value={key}>
                    {icon} {label}
                  </option>
                ))}
              </datalist>
            </div>
            <div className="grid-xs" hidden={budgets.length === 1}>
              <label htmlFor="newExpenseBudget">Budget</label>
              <select name="newExpenseBudget" id="newExpenseBudget" required ref={budgetRef}>
                {budgets
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map((budget) => (
                    <option key={budget.id || budget._id} value={budget.id || budget._id}>
                      {budget.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
        <div className="receipt-capture-row">
          <input
            ref={receiptInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="receipt-file-input"
            onChange={handleReceiptCapture}
          />
          <button
            type="button"
            className="btn btn--outline receipt-scan-btn"
            onClick={() => receiptInputRef.current?.click()}
            disabled={isSubmitting || isScanningReceipt || !budgets.length}
          >
            <CameraIcon width={20} />
            <span>{isScanningReceipt ? scanStatus || "Scanning..." : "Scan receipt"}</span>
          </button>
        </div>
        <input type="hidden" name="_action" value="createExpense" />
        <button type="submit" className="btn btn--dark" disabled={isSubmitting || isScanningReceipt}>
          {isSubmitting ? (
            <span>Submitting...</span>
          ) : isScanningReceipt ? (
            <span>{scanStatus || "Scanning..."}</span>
          ) : (
            <>
              <span>Add Expense</span>
              <PlusCircleIcon width={20} />
            </>
          )}
        </button>
      </fetcher.Form>
    </div>
  );
};

export default AddExpenseForm;
