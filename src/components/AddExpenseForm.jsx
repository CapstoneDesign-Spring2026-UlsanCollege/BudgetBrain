import { useEffect, useRef, useState } from "react";
import { useFetcher, useRevalidator } from "react-router-dom";
import { toast } from "react-toastify";
import { CameraIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { BASE_CURRENCY, createExpense, getSelectedLanguage } from "../helpers";
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
    liveScan: "Live scan",
    detectedTitle: "Detected receipt transactions",
    editHint: "Edit the items, uncheck anything wrong, then save them.",
    receiptTotal: "Receipt total",
    totalHint: "This total will be used for the budget if item rows do not match.",
    saveDetected: "Save detected transactions",
    saving: "Saving...",
  },
  ne: {
    uploadReceipt: "रसिद अपलोड गर्नुहोस्",
    liveScan: "लाइभ स्क्यान",
    detectedTitle: "पत्ता लागेका रसिद कारोबारहरू",
    editHint: "गलत कुरा हटाउनुहोस्, चाहिएको आइटम सच्याउनुहोस्, अनि सेभ गर्नुहोस्।",
    receiptTotal: "रसिद जम्मा",
    totalHint: "आइटमहरू नमिलेमा यो जम्मा रकम बजेटमा प्रयोग हुन्छ।",
    saveDetected: "पत्ता लागेका कारोबार सेभ गर्नुहोस्",
    saving: "सेभ हुँदैछ...",
  },
  ko: {
    uploadReceipt: "영수증 업로드",
    liveScan: "실시간 스캔",
    detectedTitle: "감지된 영수증 거래",
    editHint: "항목을 수정하고 잘못된 항목은 선택 해제한 뒤 저장하세요.",
    receiptTotal: "영수증 합계",
    totalHint: "항목 합계가 맞지 않으면 이 합계 금액을 예산에 사용합니다.",
    saveDetected: "감지된 거래 저장",
    saving: "저장 중...",
  },
};

const getReceiptCopy = (language) => RECEIPT_LANGUAGE_COPY[language] || RECEIPT_LANGUAGE_COPY.en;

const formatDetectedReceiptTotal = (amount, currency) => {
  if (currency === "KRW") return `₩${Number(amount || 0).toLocaleString()}`;
  return `Rs. ${Number(amount || 0).toLocaleString()}`;
};

const formatStoredReceiptTotal = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

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
  const [receiptTotalAmount, setReceiptTotalAmount] = useState(null);
  const [receiptMerchantName, setReceiptMerchantName] = useState("");
  const [receiptCurrency, setReceiptCurrency] = useState("NPR");
  const [receiptStoredTotalAmount, setReceiptStoredTotalAmount] = useState(null);
  const [appLanguage, setAppLanguage] = useState(getSelectedLanguage());
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
  const receiptCopy = getReceiptCopy(appLanguage);

  useEffect(() => {
    const justSubmitted = previousFetcherState.current === "submitting" && fetcher.state === "idle";

    if (justSubmitted && !isScanningReceipt && formRef.current && focusRef.current) {
      formRef.current.reset();
      setCategoryChoice("other");
      setCustomCategory("");
      setReceiptTotalAmount(null);
      setReceiptMerchantName("");
      setReceiptCurrency("NPR");
      setReceiptStoredTotalAmount(null);
      focusRef.current.focus();
    }

    previousFetcherState.current = fetcher.state;
  }, [fetcher.state, isScanningReceipt]);

  useEffect(() => () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => setAppLanguage(getSelectedLanguage());
    window.addEventListener("budgetbrain-language-change", handleLanguageChange);
    return () => window.removeEventListener("budgetbrain-language-change", handleLanguageChange);
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const updateStoredReceiptPreview = async () => {
      if (!receiptTotalAmount) {
        setReceiptStoredTotalAmount(null);
        return;
      }

      if (receiptCurrency === BASE_CURRENCY) {
        setReceiptStoredTotalAmount(Math.round(receiptTotalAmount));
        return;
      }

      try {
        const res = await api.get("/exchange/rate", {
          params: { from: receiptCurrency, to: BASE_CURRENCY },
        });
        const rate = Number(res.data?.rate);
        if (isCurrent && Number.isFinite(rate) && rate > 0) {
          setReceiptStoredTotalAmount(Math.max(1, Math.round(receiptTotalAmount * rate)));
        }
      } catch (err) {
        if (isCurrent) setReceiptStoredTotalAmount(null);
      }
    };

    updateStoredReceiptPreview();
    return () => {
      isCurrent = false;
    };
  }, [receiptCurrency, receiptTotalAmount]);

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

    const amountPattern = /(?:rs\.?|npr|रू|रु|रुपैयाँ|₹)?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/gi;
    const strongTotalKeywords = /grand\s*total|net\s*(amount|total)|amount\s*due|balance\s*due|total\s*amount|invoice\s*total|bill\s*total/i;
    const totalKeywords = /grand\s*total|net\s*(amount|total)|amount\s*due|balance\s*due|total\s*amount|invoice\s*total|bill\s*total|(^|\s)total($|\s|:)|payable|due/i;
    const subtotalKeywords = /sub\s*total|subtotal|taxable|before\s*tax/i;
    const noisyAmountLine = /invoice\s*(no|#)|bill\s*(no|#)|phone|tel|mobile|vat\s*(no|#)|pan|date|time|table|token|order\s*(no|#)|qty|quantity|unit\s*price/i;
    const paymentNoise = /change|tender|cash|card|wallet|paid\s*by|payment/i;
    const groupedAmountPattern = /([0-9]{1,3}(?:[\s,][0-9]{3})+(?:\.[0-9]{1,2})?)/g;
    const krwAmountPattern = /(?:\u20A9|krw|won|\uC6D0)\s*([0-9][0-9,.\s]{0,14})|([0-9][0-9,.\s]{0,14})\s*(?:\u20A9|krw|won|\uC6D0)/gi;
    const multilingualStrongTotalKeywords = /합계|총액|총\s*합계|결제\s*금액|승인\s*금액|청구\s*금액|जम्मा|कुल/i;
    const multilingualTotalKeywords = /합계|총액|총\s*합계|결제\s*금액|승인\s*금액|청구\s*금액|받을\s*금액|जम्मा|कुल|तिर्नुपर्ने/i;
    const multilingualSubtotalKeywords = /소계|공급\s*가액|과세\s*물품|면세\s*물품|उपजम्मा/i;
    const multilingualNoisyAmountLine = /사업자|대표|전화|주소|일시|날짜|시간|승인\s*번호|카드\s*번호|영수증|수량|단가|क्रम|फोन|मिति/i;
    const multilingualPaymentNoise = /거스름돈|받은\s*금액|현금|카드|결제|승인|नगद|कार्ड|भुक्तानी/i;

    const candidates = [];
    normalizedLines.forEach((line, index) => {
      const matches = [
        ...line.matchAll(amountPattern),
        ...line.matchAll(groupedAmountPattern),
        ...line.matchAll(krwAmountPattern),
      ];
      matches.forEach((match) => {
        const value = normalizeReceiptAmount(match[1] || match[2]);
        if (!Number.isFinite(value) || value <= 0 || value > 10000000) return;
        const hasStrongTotal = strongTotalKeywords.test(line) || multilingualStrongTotalKeywords.test(line);
        const hasTotal = totalKeywords.test(line) || multilingualTotalKeywords.test(line);
        const isSubtotal = subtotalKeywords.test(line) || multilingualSubtotalKeywords.test(line);
        const isNoise = noisyAmountLine.test(line) || multilingualNoisyAmountLine.test(line);
        const isPaymentNoise = paymentNoise.test(line) || multilingualPaymentNoise.test(line);
        candidates.push({
          value,
          score:
            (hasStrongTotal ? 300 : 0)
            + (hasTotal ? 170 : 0)
            - (isSubtotal ? 220 : 0)
            - (isNoise ? 160 : 0)
            - (isPaymentNoise && !hasTotal ? 90 : 0)
            + index / 100,
        });
      });
      if ((totalKeywords.test(line) || multilingualTotalKeywords.test(line)) && matches.length === 0 && normalizedLines[index + 1]) {
        const nextMatches = [
          ...normalizedLines[index + 1].matchAll(amountPattern),
          ...normalizedLines[index + 1].matchAll(groupedAmountPattern),
          ...normalizedLines[index + 1].matchAll(krwAmountPattern),
        ];
        nextMatches.forEach((match) => {
          const value = normalizeReceiptAmount(match[1] || match[2]);
          if (!Number.isFinite(value) || value <= 0 || value > 10000000) return;
          candidates.push({ value, score: 250 + index / 100 });
        });
      }
    });

    const scoredCandidates = candidates.filter((candidate) => candidate.score > -120);
    const meaningfulCandidates = hasKrwReceipt
      ? scoredCandidates.filter((candidate) => candidate.value >= 1000)
      : scoredCandidates;
    const amount = (meaningfulCandidates.length ? meaningfulCandidates : scoredCandidates)
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
    setReceiptTotalAmount(Number(parsed.amount || 0) > 0 ? Math.round(parsed.amount) : null);
    setReceiptMerchantName(parsed.name || "Receipt total");
    setReceiptCurrency(parsed.currency || "NPR");
    setReceiptStoredTotalAmount(parsed.currency === BASE_CURRENCY ? Math.round(parsed.amount) : null);
    setReceiptItems(parsed.items?.length
      ? parsed.items
      : [{ name: parsed.name || "Receipt expense", amount: Math.round(parsed.amount) }]
    );
  };

  const scanReceiptImage = async (imageSource) => {
    if (!budgets.length) {
      toast.error("Create a budget before scanning a receipt.");
      return;
    }

    setIsScanningReceipt(true);
    setScanStatus("Reading receipt with PaddleOCR...");

    try {
      let ocrText = "";
      let provider = "PaddleOCR";

      try {
        ocrText = await readWithPaddleOcr(imageSource);
      } catch (paddleErr) {
        console.warn("PaddleOCR unavailable, using browser OCR:", paddleErr.userMessage || paddleErr.message);
        provider = "browser OCR";
        setScanStatus("Reading receipt with browser OCR...");
        const Tesseract = await loadTesseract();
        const { data } = await Tesseract.recognize(imageSource, "eng+kor+nep", {
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

      applyParsedReceipt(parsed);
      toast.success(`${provider} read the receipt. Found ${parsed.items.length} transaction${parsed.items.length === 1 ? "" : "s"} to review.`);
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

  const convertReceiptAmountToAccountingCurrency = async (amount) => {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) return 0;
    if (receiptCurrency === BASE_CURRENCY) return Math.round(numericAmount);

    const res = await api.get("/exchange/rate", {
      params: { from: receiptCurrency, to: BASE_CURRENCY },
    });
    const rate = Number(res.data?.rate);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error(`Could not convert ${receiptCurrency} to ${BASE_CURRENCY}`);
    }

    return Math.max(1, Math.round(numericAmount * rate));
  };

  const saveReceiptItems = async () => {
    const budgetId = budgetRef.current?.value || budgets[0]?.id || budgets[0]?._id;
    const selectedItems = receiptItems.filter((item) => (
      !item.skipped
      && item.name?.trim()
      && Number.isFinite(Number(item.amount))
      && Number(item.amount) > 0
    ));
    const selectedTotal = selectedItems.reduce((total, item) => total + Number(item.amount || 0), 0);
    const totalTolerance = receiptTotalAmount ? Math.max(5, receiptTotalAmount * 0.05) : 0;
    const shouldSaveReceiptTotal = receiptTotalAmount
      && selectedItems.length > 0
      && Math.abs(selectedTotal - receiptTotalAmount) > totalTolerance;
    const expensesToSave = shouldSaveReceiptTotal
      ? [{
        name: receiptMerchantName || selectedItems[0]?.name || "Receipt total",
        amount: receiptTotalAmount,
      }]
      : selectedItems;

    if (!budgetId) return toast.error("Choose a budget before saving receipt items.");
    if (!selectedItems.length) return toast.error("Select at least one receipt item to save.");

    setIsSavingReceiptItems(true);
    try {
      const convertedExpenses = await Promise.all(expensesToSave.map(async (item) => ({
        ...item,
        amount: await convertReceiptAmountToAccountingCurrency(item.amount),
      })));

      await Promise.all(convertedExpenses.map((item) => createExpense({
        name: item.name.trim(),
        amount: item.amount,
        budgetId,
        category: finalCategory || "other",
      })));
      toast.success(`${expensesToSave.length} receipt transaction${expensesToSave.length === 1 ? "" : "s"} saved.`);
      setReceiptItems([]);
      setReceiptTotalAmount(null);
      setReceiptMerchantName("");
      setReceiptCurrency("NPR");
      setReceiptStoredTotalAmount(null);
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
            <span>{isScanningReceipt ? scanStatus || "Scanning..." : receiptCopy.uploadReceipt}</span>
          </button>
          <button
            type="button"
            className="btn btn--outline receipt-scan-btn"
            onClick={openLiveCamera}
            disabled={isSubmitting || isScanningReceipt || !budgets.length}
          >
            <CameraIcon width={20} />
            <span>{receiptCopy.liveScan}</span>
          </button>
        </div>
        {receiptItems.length > 0 && (
          <div className="receipt-review-panel">
            <div className="receipt-review-header">
              <strong>{receiptCopy.detectedTitle}</strong>
              <small>
                {receiptTotalAmount
                  ? `${receiptCopy.receiptTotal}: ${formatDetectedReceiptTotal(receiptTotalAmount, receiptCurrency)}. ${
                    receiptStoredTotalAmount && receiptCurrency !== BASE_CURRENCY
                      ? `Saves as ${formatStoredReceiptTotal(receiptStoredTotalAmount)}. `
                      : ""
                  }${receiptCopy.totalHint}`
                  : receiptCopy.editHint}
              </small>
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
              <span>{isSavingReceiptItems ? receiptCopy.saving : receiptCopy.saveDetected}</span>
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
