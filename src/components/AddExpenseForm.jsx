import { useEffect, useRef, useState } from "react";
import { useFetcher } from "react-router-dom";
import { toast } from "react-toastify";
import { CameraIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import { BASE_CURRENCY, getSelectedLanguage } from "../helpers";
import api from "../api";

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

const imageSourceToDataUrl = (imageSource) => new Promise((resolve, reject) => {
  if (typeof imageSource === "string" && imageSource.startsWith("data:image/")) {
    resolve(imageSource);
    return;
  }

  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = reject;
  reader.readAsDataURL(imageSource);
});

const enhanceReceiptImage = async (imageSource) => {
  const imageUrl = await imageSourceToDataUrl(imageSource);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageUrl;
  });

  const maxWidth = 1800;
  const scale = Math.min(2, Math.max(1, maxWidth / image.width));
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, width, height);

  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  for (let index = 0; index < data.length; index += 4) {
    const gray = (data[index] * 0.299) + (data[index + 1] * 0.587) + (data[index + 2] * 0.114);
    const contrasted = Math.max(0, Math.min(255, (gray - 128) * 1.35 + 128));
    const sharpened = contrasted > 190 ? 255 : contrasted < 80 ? 0 : contrasted;
    data[index] = sharpened;
    data[index + 1] = sharpened;
    data[index + 2] = sharpened;
  }

  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/jpeg", 0.92);
};

const readWithPaddleOcr = async (imageSource) => {
  const image = await imageSourceToDataUrl(imageSource);
  const res = await api.post("/ocr/receipt", { image });
  return res.data?.text || "";
};

const RECEIPT_NAME_TRANSLATIONS = [
  { pattern: /^(grand\s*)?total|total\s*amount|amount\s*due|payable|합계|총액|총\s*합계|결제\s*금액|청구\s*금액|जम्मा|कुल/i, label: "Receipt total / जम्मा / 합계" },
  { pattern: /sub\s*total|subtotal|소계|공급\s*가액|उपजम्मा/i, label: "Subtotal / उपजम्मा / 소계" },
  { pattern: /tax|vat|부가세|세금|कर/i, label: "Tax / कर / 세금" },
  { pattern: /discount|할인|छुट/i, label: "Discount / छुट / 할인" },
  { pattern: /cash|현금|नगद/i, label: "Cash payment / नगद / 현금" },
  { pattern: /card|카드|credit|debit|कार्ड/i, label: "Card payment / कार्ड / 카드" },
  { pattern: /change|거스름돈|फिर्ता/i, label: "Change / फिर्ता / 거스름돈" },
  { pattern: /coffee|cafe|카페|커피/i, label: "Cafe / क्याफे / 카페" },
  { pattern: /restaurant|food|식당|음식|meal|खाना/i, label: "Food / खाना / 음식" },
  { pattern: /mart|market|store|마트|편의점|슈퍼|grocery|किराना/i, label: "Groceries / किराना / 식료품" },
  { pattern: /taxi|bus|subway|transport|택시|버스|지하철|교통|यातायात/i, label: "Transport / यातायात / 교통" },
];

const makeReceiptNameReadable = (rawName, fallback = "Receipt expense") => {
  const cleaned = String(rawName || "")
    .replace(/^[*\-\d.\s:]+/, "")
    .replace(/[(){}\[\]]/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();

  if (!cleaned) return fallback;

  const translated = RECEIPT_NAME_TRANSLATIONS.find(({ pattern }) => pattern.test(cleaned));
  return translated ? translated.label : cleaned;
};

const RECEIPT_LANGUAGE_COPY = {
  en: {
    uploadReceipt: "Upload receipt",
  },
  ne: {
    uploadReceipt: "रसिद अपलोड गर्नुहोस्",
  },
  ko: {
    uploadReceipt: "영수증 업로드",
  },
};

const getReceiptCopy = (language) => RECEIPT_LANGUAGE_COPY[language] || RECEIPT_LANGUAGE_COPY.en;

const RECEIPT_DEFAULT_NAMES = {
  en: "Receipt expense",
  ne: "रसिद खर्च",
  ko: "영수증 지출",
};

const getReceiptDefaultName = (language) => RECEIPT_DEFAULT_NAMES[language] || RECEIPT_DEFAULT_NAMES.en;

const AddExpenseForm = ({ budgets }) => {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";
  const [isScanningReceipt, setIsScanningReceipt] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [categoryChoice, setCategoryChoice] = useState("other");
  const [customCategory, setCustomCategory] = useState("");
  const [appLanguage, setAppLanguage] = useState(getSelectedLanguage());
  const formRef = useRef();
  const focusRef = useRef();
  const amountRef = useRef();
  const categorySelectRef = useRef();
  const customCategoryRef = useRef();
  const budgetRef = useRef();
  const receiptInputRef = useRef();
  const previousFetcherState = useRef(fetcher.state);

  const finalCategory = categoryChoice === "custom"
    ? customCategory.trim()
    : categoryChoice;
  const receiptCopy = getReceiptCopy(appLanguage);

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

  useEffect(() => {
    const handleLanguageChange = () => setAppLanguage(getSelectedLanguage());
    window.addEventListener("budgetbrain-language-change", handleLanguageChange);
    return () => window.removeEventListener("budgetbrain-language-change", handleLanguageChange);
  }, []);

  const parseReceiptText = (text) => {
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const normalizedText = text
      .replace(/[|]/g, "1")
      .replace(/[Oo](?=[.,\d])/g, "0");
    const normalizedLines = normalizedText
      .split(/\r?\n/)
      .map((line) => line.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const normalizeReceiptAmount = (rawValue) => {
      const compactValue = String(rawValue || "")
        .replace(/\s+/g, "")
        .replace(/,/g, "")
        .trim();

      if (/^\d{1,3}\.\d{3}$/.test(compactValue)) {
        return Number(compactValue.replace(".", ""));
      }

      return Number(compactValue);
    };
    const hasKrwReceipt = /[\u20A9\uC6D0]|krw|won|[\u3131-\u318E\uAC00-\uD7A3]/i.test(normalizedText);
    const hasCurrencySymbol = /[\u20A9\uC6D0₹]|rs\.?|npr|krw|won/i;

    const amountPattern = /(?:rs\.?|npr|रू|रु|रुपैयाँ|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
    const strongTotalKeywords = /grand\s*total|net\s*(amount|total)|amount\s*due|balance\s*due|total\s*amount|invoice\s*total|bill\s*total/i;
    const totalKeywords = /grand\s*total|net\s*(amount|total)|amount\s*due|balance\s*due|total\s*amount|invoice\s*total|bill\s*total|(^|\s)total($|\s|:)|payable|due/i;
    const subtotalKeywords = /sub\s*total|subtotal|taxable|before\s*tax/i;
    const noisyAmountLine = /invoice\s*(no|#)|bill\s*(no|#)|phone|tel|mobile|vat\s*(no|#)|pan|date|time|table|token|order\s*(no|#)|qty|quantity|unit\s*price/i;
    const paymentNoise = /change|tender|cash|card|wallet|paid\s*by|payment/i;
    const koreanStrongTotalKeywords = /\uD569\uACC4|\uCD1D\uC561|\uCD1D\s*\uD569\uACC4|\uACB0\uC81C\s*\uAE08\uC561|\uC2B9\uC778\s*\uAE08\uC561|\uCCAD\uAD6C\s*\uAE08\uC561|\uBC1B\uC744\s*\uAE08\uC561|\uD310\uB9E4\s*\uAE08\uC561|\uB9E4\uCD9C\s*\uAE08\uC561/i;
    const koreanSubtotalKeywords = /\uC18C\uACC4|\uACF5\uAE09\s*\uAC00\uC561|\uACFC\uC138\s*\uBB3C\uD488|\uBA74\uC138\s*\uBB3C\uD488/i;
    const koreanNoisyAmountLine = /\uC0AC\uC5C5\uC790|\uB300\uD45C|\uC804\uD654|\uC8FC\uC18C|\uC77C\uC2DC|\uB0A0\uC9DC|\uC2DC\uAC04|\uC2B9\uC778\s*\uBC88\uD638|\uCE74\uB4DC\s*\uBC88\uD638|\uC601\uC218\uC99D|\uC218\uB7C9|\uB2E8\uAC00/i;
    const koreanPaymentNoise = /\uAC70\uC2A4\uB984\uB3C8|\uBC1B\uC740\s*\uAE08\uC561|\uD604\uAE08|\uCE74\uB4DC|\uACB0\uC81C|\uC2B9\uC778/i;
    const dateOrTimeNoise = /\b(?:20\d{2}|19\d{2})[./-]\d{1,2}[./-]\d{1,2}\b|\b\d{1,2}:\d{2}(?::\d{2})?\b/;
    const groupedAmountPattern = /([0-9]{1,3}(?:[\s,][0-9]{3})+(?:\.[0-9]{1,2})?)/g;
    const krwAmountPattern = /(?:\u20A9|krw|won|\uC6D0)\s*([0-9][0-9,.\s]{0,14})|([0-9][0-9,.\s]{0,14})\s*(?:\u20A9|krw|won|\uC6D0)/gi;
    const multilingualStrongTotalKeywords = /합계|총액|총\s*합계|결제\s*금액|승인\s*금액|청구\s*금액|जम्मा|कुल/i;
    const multilingualTotalKeywords = /합계|총액|총\s*합계|결제\s*금액|승인\s*금액|청구\s*금액|받을\s*금액|जम्मा|कुल|तिर्नुपर्ने/i;
    const multilingualSubtotalKeywords = /소계|공급\s*가액|과세\s*물품|면세\s*물품|उपजम्मा/i;
    const multilingualNoisyAmountLine = /사업자|대표|전화|주소|일시|날짜|시간|승인\s*번호|카드\s*번호|영수증|수량|단가|क्रम|फोन|मिति/i;
    const multilingualPaymentNoise = /거스름돈|받은\s*금액|현금|카드|결제|승인|नगद|कार्ड|भुक्तानी/i;

    const candidates = [];
    normalizedLines.forEach((line, index) => {
      const previousLine = normalizedLines[index - 1] || "";
      const nextLine = normalizedLines[index + 1] || "";
      const contextLine = `${previousLine} ${line} ${nextLine}`;
      const matches = [
        ...line.matchAll(amountPattern),
        ...line.matchAll(groupedAmountPattern),
        ...line.matchAll(krwAmountPattern),
      ];
      matches.forEach((match) => {
        const value = normalizeReceiptAmount(match[1] || match[2]);
        if (!Number.isFinite(value) || value <= 0 || value > 10000000) return;
        const lineHasStrongTotal = strongTotalKeywords.test(line) || multilingualStrongTotalKeywords.test(line) || koreanStrongTotalKeywords.test(line);
        const contextHasStrongTotal = strongTotalKeywords.test(contextLine) || multilingualStrongTotalKeywords.test(contextLine) || koreanStrongTotalKeywords.test(contextLine);
        const hasStrongTotal = lineHasStrongTotal || contextHasStrongTotal;
        const hasTotal = totalKeywords.test(contextLine) || multilingualTotalKeywords.test(contextLine) || koreanStrongTotalKeywords.test(contextLine);
        const isSubtotal = subtotalKeywords.test(contextLine) || multilingualSubtotalKeywords.test(contextLine) || koreanSubtotalKeywords.test(contextLine);
        const isNoise = noisyAmountLine.test(line) || multilingualNoisyAmountLine.test(line) || koreanNoisyAmountLine.test(line) || dateOrTimeNoise.test(line);
        const isPaymentNoise = paymentNoise.test(line) || multilingualPaymentNoise.test(line) || koreanPaymentNoise.test(line);
        const hasCurrency = hasCurrencySymbol.test(line);
        const isTinyReceiptFragment = hasKrwReceipt && value < 1000 && !hasStrongTotal && !hasCurrency;
        candidates.push({
          value,
          highConfidence: lineHasStrongTotal || (hasCurrency && contextHasStrongTotal),
          score:
            (hasStrongTotal ? 300 : 0)
            + (hasTotal ? 170 : 0)
            + (hasCurrency ? 80 : 0)
            + (index / Math.max(1, normalizedLines.length - 1)) * 30
            - (isSubtotal ? 220 : 0)
            - (isNoise ? 160 : 0)
            - (isPaymentNoise && !hasTotal ? 90 : 0)
            - (isTinyReceiptFragment ? 260 : 0),
        });
      });
      if ((totalKeywords.test(line) || multilingualTotalKeywords.test(line) || koreanStrongTotalKeywords.test(line)) && matches.length === 0 && normalizedLines[index + 1]) {
        const nextMatches = [
          ...normalizedLines[index + 1].matchAll(amountPattern),
          ...normalizedLines[index + 1].matchAll(groupedAmountPattern),
          ...normalizedLines[index + 1].matchAll(krwAmountPattern),
        ];
        nextMatches.forEach((match) => {
          const value = normalizeReceiptAmount(match[1] || match[2]);
          if (!Number.isFinite(value) || value <= 0 || value > 10000000) return;
          candidates.push({ value, highConfidence: true, score: 250 + index / 100 });
        });
      }
    });

    const scoredCandidates = candidates.filter((candidate) => candidate.score > -120);
    const confidentCandidates = scoredCandidates.filter((candidate) => candidate.highConfidence);
    const meaningfulCandidates = hasKrwReceipt
      ? confidentCandidates.filter((candidate) => candidate.value >= 1000)
      : (confidentCandidates.length ? confidentCandidates : scoredCandidates);
    const amount = (meaningfulCandidates.length ? meaningfulCandidates : scoredCandidates.filter((candidate) => !hasKrwReceipt && candidate.value > 0))
      .sort((a, b) => b.score - a.score || b.value - a.value)[0]?.value;

    const merchant = lines.find((line) => (
      /[a-z가-힣\u0900-\u097F]/i.test(line)
      && !totalKeywords.test(line)
      && !multilingualTotalKeywords.test(line)
      && !noisyAmountLine.test(line)
      && !multilingualNoisyAmountLine.test(line)
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
        if (totalKeywords.test(name) || multilingualTotalKeywords.test(name) || noisyAmountLine.test(name) || multilingualNoisyAmountLine.test(name)) return null;
        if (/subtotal|discount|change|cash|card|tax|vat|service|round|소계|할인|거스름돈|현금|카드|부가세|सेवा|कर|छुट/i.test(name)) return null;

        return { name: makeReceiptNameReadable(name), amount: Math.round(itemAmount) };
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
      [/restaurant|cafe|coffee|food|pizza|burger|bakery|grocery|mart|store|supermarket|식당|음식|카페|커피|마트|편의점|슈퍼|빵|खाना|क्याफे|किराना/, "food"],
      [/taxi|bus|fuel|petrol|parking|transport|uber|pathao|택시|버스|지하철|주유|교통|यातायात|बस|ट्याक्सी/, "transport"],
      [/rent|apartment|house|housing|월세|임대|아파트|집|भाडा|घर/, "housing"],
      [/electric|water|internet|wifi|utility|utilities|전기|수도|인터넷|와이파이|공과금|बिजुली|पानी|इन्टरनेट/, "utilities"],
      [/hospital|clinic|pharmacy|medicine|health|병원|약국|의료|약|अस्पताल|औषधी|स्वास्थ्य/, "healthcare"],
      [/movie|cinema|game|music|entertainment|영화|게임|노래|오락|मनोरञ्जन/, "entertainment"],
      [/school|college|book|tuition|education|학교|학원|책|교육|विद्यालय|कलेज|किताब|शिक्षा/, "education"],
      [/hotel|flight|travel|airlines|호텔|항공|여행|होटल|यात्रा/, "travel"],
      [/salon|beauty|personal|미용|헤어|개인|सैलुन|व्यक्तिगत/, "personal"],
      [/shop|mall|clothes|fashion|shopping|쇼핑|백화점|옷|패션|किनमेल|लुगा/, "shopping"],
    ].find(([pattern]) => pattern.test(lowerText))?.[1] || "other";

    const itemTotal = itemLines.reduce((total, item) => total + Number(item.amount || 0), 0);
    const amountTolerance = amount ? Math.max(5, amount * 0.08) : 0;
    const itemLinesMatchTotal = itemLines.length > 0
      && (!amount || Math.abs(itemTotal - amount) <= amountTolerance);
    const readableMerchant = makeReceiptNameReadable(merchant, "Receipt total / जम्मा / 합계");
    const fallbackItem = amount
      ? [{ name: readableMerchant, amount: Math.round(amount) }]
      : [];

    return {
      amount,
      name: readableMerchant,
      currency: hasKrwReceipt ? "KRW" : "NPR",
      category,
      items: itemLinesMatchTotal ? itemLines : fallbackItem,
    };
  };

  const convertReceiptAmountToAccountingCurrency = async (amount, currency = BASE_CURRENCY) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    if (currency === BASE_CURRENCY) return Math.round(numericAmount);

    const res = await api.get("/exchange/rate", {
      params: { from: currency, to: BASE_CURRENCY },
    });
    const rate = Number(res.data?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Could not convert ${currency} to ${BASE_CURRENCY}`);
    }

    return Math.max(1, Math.round(numericAmount * rate));
  };

  const applyParsedReceipt = async (parsed) => {
    const parsedCurrency = parsed.currency || BASE_CURRENCY;
    const storedAmount = await convertReceiptAmountToAccountingCurrency(parsed.amount, parsedCurrency);
    const receiptName = getReceiptDefaultName(appLanguage);

    if (focusRef.current) focusRef.current.value = receiptName;
    if (amountRef.current) amountRef.current.value = storedAmount;
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
  };

  const scanReceiptImage = async (imageSource) => {
    if (!budgets.length) {
      toast.error("Create a budget before scanning a receipt.");
      return;
    }

    setIsScanningReceipt(true);
    setScanStatus("Reading receipt with PaddleOCR...");

    try {
      const enhancedImage = await enhanceReceiptImage(imageSource);
      let ocrText = "";
      let provider = "PaddleOCR";

      try {
        ocrText = await readWithPaddleOcr(enhancedImage);
        try {
          const originalText = await readWithPaddleOcr(imageSource);
          if (originalText && !ocrText.includes(originalText)) {
            ocrText = `${ocrText}\n${originalText}`;
          }
        } catch (originalErr) {
          console.warn("Original receipt OCR pass failed:", originalErr.userMessage || originalErr.message);
        }
      } catch (paddleErr) {
        console.warn("PaddleOCR unavailable, using browser OCR:", paddleErr.userMessage || paddleErr.message);
        provider = "browser OCR";
        setScanStatus("Reading receipt with browser OCR...");
        const Tesseract = await loadTesseract();
        const { data } = await Tesseract.recognize(enhancedImage, "eng+kor+nep", {
          logger: (message) => {
            if (message.status === "recognizing text") {
              setScanStatus(`Reading receipt ${Math.round((message.progress || 0) * 100)}%`);
            }
          },
        });
        ocrText = data.text || "";
      }

      const parsed = parseReceiptText(ocrText);
      if (!parsed.amount) {
        toast.error("I could not find a total amount on that receipt.");
        return;
      }

      await applyParsedReceipt(parsed);
      toast.success(`${provider} read the receipt. Amount added to the expense form.`);
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
            <span>{isScanningReceipt ? scanStatus || "Scanning..." : receiptCopy.uploadReceipt}</span>
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
