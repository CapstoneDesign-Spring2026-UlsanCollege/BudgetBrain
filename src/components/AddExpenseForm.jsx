import { useEffect, useRef, useState } from "react";
import { useFetcher, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import { CameraIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { createExpense } from "../helpers";

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
  const revalidator = useRevalidator();
  const isSubmitting = fetcher.state === "submitting";
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [isSavingReceiptItems, setIsSavingReceiptItems] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [categoryChoice, setCategoryChoice] = useState("other");
  const [customCategory, setCustomCategory] = useState("");
  const [receiptItems, setReceiptItems] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const formRef = useRef();
  const focusRef = useRef();
  const amountRef = useRef();
  const categorySelectRef = useRef();
  const customCategoryRef = useRef();
  const budgetRef = useRef();
  const receiptInputRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const streamRef = useRef(null);
  const previousFetcherState = useRef(fetcher.state);

  const finalCategory = categoryChoice === "custom"
    ? customCategory.trim()
    : categoryChoice;

  useEffect(() => {
    const justSubmitted = previousFetcherState.current === "submitting" && fetcher.state === "idle";

    if (justSubmitted && !isScanningReceipt && formRef.current && focusRef.current) {
      formRef.current.reset();
      setCategoryChoice("other");
      setCustomCategory("");
      focusRef.current.focus();
    }

    previousFetcherState.current = fetcher.state;
  }, [fetcher.state, isScanningReceipt]);

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

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

    const itemLines = lines
      .map((line) => {
        const match = line.match(/^(.{3,70}?)\s+(?:rs\.?|npr|रू|रु|रुपैयाँ|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)$/i);
        if (!match) return null;

        const name = match[1]
          .replace(/^[*\-•\d.\s]+/, "")
          .replace(/\s{2,}/g, " ")
          .trim();
        const itemAmount = Number(match[2].replace(/,/g, ""));

        if (!name || !Number.isFinite(itemAmount) || itemAmount <= 0) return null;
        if (name.length < 3 || name.length > 60) return null;
        if (totalKeywords.test(name) || noisyAmountLine.test(name)) return null;
        if (/subtotal|discount|change|cash|card|tax|vat|service|round/i.test(name)) return null;

        return { name, amount: Math.round(itemAmount) };
      })
      .filter(Boolean)
      .filter((item, index, arr) => (
        arr.findIndex((candidate) => (
          candidate.name.toLowerCase() === item.name.toLowerCase()
          && candidate.amount === item.amount
        )) === index
      ))
      .slice(0, 12);

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
      items: itemLines,
    };
  };

  const applyParsedReceipt = (parsed) => {
    if (focusRef.current) focusRef.current.value = parsed.name;
    if (amountRef.current) amountRef.current.value = Math.round(parsed.amount);
    const knownCategory = EXPENSE_CATEGORIES.some(([key]) => key === parsed.category);
    if (knownCategory) {
      setCategoryChoice(parsed.category);
      setCustomCategory("");
    } else {
      setCategoryChoice("custom");
      setCustomCategory(parsed.category);
    }
    if (budgetRef.current && !budgetRef.current.value) {
      budgetRef.current.value = budgets[0].id || budgets[0]._id;
    }
    setReceiptItems(parsed.items || []);
  };

  const scanReceiptImage = async (imageSource) => {
    if (!budgets.length) {
      toast.error("Create a budget before scanning a receipt.");
      return;
    }

    setIsScanningReceipt(true);
    setScanStatus("Reading receipt...");

    try {
      const Tesseract = await loadTesseract();
      const { data } = await Tesseract.recognize(imageSource, "eng", {
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

      applyParsedReceipt(parsed);
      toast.success(
        parsed.items?.length
          ? `Receipt read. Found ${parsed.items.length} possible line item${parsed.items.length === 1 ? "" : "s"}.`
          : `Receipt read: Rs. ${Math.round(parsed.amount).toLocaleString()}. Review and tap Add Expense.`
      );
    } catch (err) {
      console.error("Receipt scan failed:", err);
      toast.error("Could not read the receipt. Try a clearer photo.");
    } finally {
      setIsScanningReceipt(false);
      setScanStatus("");
    }
  };

  const handleReceiptCapture = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await scanReceiptImage(file);
    } finally {
      event.target.value = "";
    }
  };

  const openLiveCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast.error("Live camera is not supported in this browser.");
      return;
    }

    setCameraError("");
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera failed:", err);
      setCameraError("Could not open the camera. Check browser camera permission.");
    }
  };

  const closeLiveCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const captureLiveReceipt = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !video.videoWidth) {
      toast.error("Camera is not ready yet.");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    closeLiveCamera();
    if (blob) await scanReceiptImage(blob);
  };

  const toggleReceiptItem = (index) => {
    setReceiptItems((items) => items.map((item, itemIndex) => (
      itemIndex === index ? { ...item, skipped: !item.skipped } : item
    )));
  };

  const updateReceiptItem = (index, field, value) => {
    setReceiptItems((items) => items.map((item, itemIndex) => (
      itemIndex === index
        ? { ...item, [field]: field === "amount" ? Number(value) : value }
        : item
    )));
  };

  const saveReceiptItems = async () => {
    const budgetId = budgetRef.current?.value || budgets[0]?.id || budgets[0]?._id;
    const selectedItems = receiptItems.filter((item) => (
      !item.skipped
      && item.name?.trim()
      && Number.isFinite(Number(item.amount))
      && Number(item.amount) > 0
    ));

    if (!budgetId) return toast.error("Choose a budget before saving receipt items.");
    if (!selectedItems.length) return toast.error("Select at least one receipt item to save.");

    setIsSavingReceiptItems(true);
    try {
      await Promise.all(selectedItems.map((item) => createExpense({
        name: item.name.trim(),
        amount: item.amount,
        budgetId,
        category: finalCategory || "other",
      })));
      toast.success(`${selectedItems.length} receipt transaction${selectedItems.length === 1 ? "" : "s"} saved.`);
      setReceiptItems([]);
      formRef.current?.reset();
      setCategoryChoice("other");
      setCustomCategory("");
      revalidator.revalidate();
    } catch (err) {
      console.error("Receipt item save failed:", err);
      toast.error(err.userMessage || "Could not save receipt transactions.");
    } finally {
      setIsSavingReceiptItems(false);
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
              <select
                id="newExpenseCategory"
                value={categoryChoice}
                onChange={(event) => setCategoryChoice(event.target.value)}
                ref={categorySelectRef}
                required
              >
                {EXPENSE_CATEGORIES.map(([key, [icon, label]]) => (
                  <option key={key} value={key}>
                    {icon} {label}
                  </option>
                ))}
                <option value="custom">+ Custom type</option>
              </select>
              {categoryChoice === "custom" && (
                <input
                  type="text"
                  placeholder="e.g., college fees"
                  value={customCategory}
                  onChange={(event) => setCustomCategory(event.target.value)}
                  ref={customCategoryRef}
                  maxLength={40}
                  required
                />
              )}
              <input type="hidden" name="category" value={finalCategory || "other"} />
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
            <span>{isScanningReceipt ? scanStatus || "Scanning..." : "Upload receipt"}</span>
          </button>
          <button
            type="button"
            className="btn btn--outline receipt-scan-btn"
            onClick={openLiveCamera}
            disabled={isSubmitting || isScanningReceipt || !budgets.length}
          >
            <CameraIcon width={20} />
            <span>Live scan</span>
          </button>
        </div>
        {receiptItems.length > 0 && (
          <div className="receipt-review-panel">
            <div className="receipt-review-header">
              <strong>Detected receipt transactions</strong>
              <small>Edit the items, uncheck anything wrong, then save them.</small>
            </div>
            <div className="receipt-items-list">
              {receiptItems.map((item, index) => (
                <label className="receipt-item-row" key={`${item.name}-${index}`}>
                  <input
                    type="checkbox"
                    checked={!item.skipped}
                    onChange={() => toggleReceiptItem(index)}
                  />
                  <input
                    type="text"
                    value={item.name}
                    onChange={(event) => updateReceiptItem(index, "name", event.target.value)}
                    aria-label={`Receipt item ${index + 1} name`}
                  />
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={item.amount}
                    onChange={(event) => updateReceiptItem(index, "amount", event.target.value)}
                    aria-label={`Receipt item ${index + 1} amount`}
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              className="btn btn--dark"
              onClick={saveReceiptItems}
              disabled={isSavingReceiptItems || isSubmitting || isScanningReceipt}
            >
              <span>{isSavingReceiptItems ? "Saving..." : "Save detected transactions"}</span>
              <PlusCircleIcon width={20} />
            </button>
          </div>
        )}
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
      {isCameraOpen && (
        <div className="receipt-camera-modal" role="dialog" aria-modal="true" aria-label="Live receipt scanner">
          <div className="receipt-camera-sheet">
            <div className="receipt-camera-header">
              <strong>Live receipt scan</strong>
              <button type="button" className="btn-icon" onClick={closeLiveCamera} aria-label="Close camera">
                <XMarkIcon width={22} />
              </button>
            </div>
            {cameraError ? (
              <p className="receipt-camera-error">{cameraError}</p>
            ) : (
              <video ref={videoRef} className="receipt-camera-preview" playsInline muted />
            )}
            <canvas ref={canvasRef} hidden />
            <div className="receipt-camera-actions">
              <button type="button" className="btn btn--outline" onClick={closeLiveCamera}>Cancel</button>
              <button type="button" className="btn btn--dark" onClick={captureLiveReceipt} disabled={Boolean(cameraError)}>
                Capture receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddExpenseForm;
