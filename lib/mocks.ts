import { DecisionBlueprint } from './types';

export const MOCK_RESPONSES: Record<string, Record<string, any>> = {
  English: {
    default: {
      score: 78,
      isDemo: true,
      language: 'English',
      recommendation: "Proceed with a measured, phased approach. The opportunity is real, but execution complexity requires careful management.",
      diagnosis: {
        coreProblem: "Strategic expansion into unproven territory.",
        blindSpots: "Overestimating internal velocity and underestimating competitive response.",
        keyRisks: "The Skeptic warns of high resource drain and potential brand dilution if the MVP fails to deliver premium value."
      },
      paths: {
        safe: {
          description: "Maintain current trajectory while running low-cost experiments.",
          pros: ["Zero capital risk", "Team focus preserved"],
          cons: ["Market opportunity loss", "Stagnation"]
        },
        balanced: {
          description: "The Operator's recommended path: Phased rollout over 12 weeks.",
          pros: ["Controlled burn", "Faster feedback"],
          cons: ["Moderate resource strain"]
        },
        bold: {
          description: "The Strategist's vision: Aggressive pivot to capture the market immediately.",
          pros: ["First-mover advantage", "High potential ROI"],
          cons: ["Binary outcome risk", "Maximum burn"]
        }
      },
      contrarianInsight: {
        perspective: "What if the market doesn't want an OS, but just a better single tool?",
        hiddenOpportunity: "Niche dominance in the 'Founder' segment before going broad.",
        uncomfortableTruth: "Your current team might not have the specific AI expertise for a full-scale engine."
      },
      futureSimulation: {
        threeMonths: "Early feedback confirms core value, but UI complexity is a hurdle.",
        twelveMonths: "SolveOS becomes the standard for high-stakes decisions in mid-market firms."
      },
      actionPlan: {
        today: "Lock down MVP spec by EOD and define success metrics.",
        thisWeek: "Set up core LangGraph nodes for Strategist and Skeptic agents.",
        thirtyDays: "Deploy initial alpha to 5 trusted testers for feedback."
      }
    }
  },
  Russian: {
    default: {
      score: 78,
      isDemo: true,
      language: 'Russian',
      recommendation: "Действуйте взвешенно и поэтапно. Возможность реальна, но сложность реализации требует тщательного управления.",
      diagnosis: {
        coreProblem: "Стратегическое расширение на непроверенную территорию.",
        blindSpots: "Переоценка внутренней скорости и недооценка реакции конкурентов.",
        keyRisks: "Скептик предупреждает о больших затратах ресурсов и возможном размытии бренда, если MVP не принесет премиальной ценности."
      },
      paths: {
        safe: {
          description: "Сохраняйте текущую траекторию, проводя недорогие эксперименты.",
          pros: ["Нулевой капитальный риск", "Сохранение фокуса команды"],
          cons: ["Упущенная рыночная возможность", "Стагнация"]
        },
        balanced: {
          description: "Рекомендуемый путь Оператора: поэтапное развертывание в течение 12 недель.",
          pros: ["Контролируемые затраты", "Быстрая обратная связь"],
          cons: ["Умеренная нагрузка на ресурсы"]
        },
        bold: {
          description: "Видение Стратега: агрессивный поворот для немедленного захвата рынка.",
          pros: ["Преимущество первопроходца", "Высокий потенциальный ROI"],
          cons: ["Риск бинарного исхода", "Максимальные затраты"]
        }
      },
      contrarianInsight: {
        perspective: "Что если рынку не нужна ОС, а просто лучший отдельный инструмент?",
        hiddenOpportunity: "Доминирование в нише 'основателей' перед выходом на широкий рынок.",
        uncomfortableTruth: "У вашей текущей команды может не быть специфического опыта в ИИ для полноценного движка."
      },
      futureSimulation: {
        threeMonths: "Первые отзывы подтверждают основную ценность, но сложность интерфейса является препятствием.",
        twelveMonths: "SolveOS становится стандартом для принятия важных решений в компаниях среднего бизнеса."
      },
      actionPlan: {
        today: "Утвердить спецификацию MVP к концу дня и определить метрики успеха.",
        thisWeek: "Настроить основные узлы LangGraph для агентов Стратега и Скептика.",
        thirtyDays: "Развернуть начальную альфа-версию для 5 доверенных тестеров для обратной связи."
      }
    }
  },
  German: {
    default: {
      score: 78,
      isDemo: true,
      language: 'German',
      recommendation: "Gehen Sie mit einem gemessenen, phasenweisen Ansatz vor. Die Chance ist real, aber die Komplexität der Ausführung erfordert sorgfältiges Management.",
      diagnosis: {
        coreProblem: "Strategische Expansion in unbewiesene Gebiete.",
        blindSpots: "Überschätzung der internen Geschwindigkeit und Unterschätzung der Wettbewerbsreaktion.",
        keyRisks: "Der Skeptiker warnt vor hohem Ressourcenverbrauch und potenzieller Markenverwässerung, wenn das MVP keinen Premium-Wert liefert."
      },
      paths: {
        safe: {
          description: "Behalten Sie den aktuellen Kurs bei, während Sie kostengünstige Experimente durchführen.",
          pros: ["Kein Kapitalrisiko", "Fokus des Teams bleibt erhalten"],
          cons: ["Verlust von Marktchancen", "Stagnation"]
        },
        balanced: {
          description: "Der vom Operator empfohlene Weg: Phasenweise Einführung über 12 Wochen.",
          pros: ["Kontrollierter Burn-Rate", "Schnelleres Feedback"],
          cons: ["Moderate Ressourcenbelastung"]
        },
        bold: {
          description: "Die Vision des Strategen: Aggressiver Schwenk, um den Markt sofort zu erobern.",
          pros: ["Pionier-Vorteil", "Hoher potenzieller ROI"],
          cons: ["Risiko eines binären Ergebnisses", "Maximaler Burn-Rate"]
        }
      },
      contrarianInsight: {
        perspective: "Was ist, wenn der Markt kein Betriebssystem will, sondern nur ein besseres Einzelwerkzeug?",
        hiddenOpportunity: "Nischendominanz im Segment 'Gründer', bevor es in die Breite geht.",
        uncomfortableTruth: "Ihr aktuelles Team verfügt möglicherweise nicht über die spezifische KI-Expertise für eine umfassende Engine."
      },
      futureSimulation: {
        threeMonths: "Frühes Feedback bestätigt den Kernwert, aber die Komplexität der Benutzeroberfläche ist eine Hürde.",
        twelveMonths: "SolveOS wird zum Standard für hochkarätige Entscheidungen in mittelständischen Unternehmen."
      },
      actionPlan: {
        today: "MVP-Spezifikation bis Ende des Tages festlegen und Erfolgsmetriken definieren.",
        thisWeek: "Kern-LangGraph-Knoten für Strategen- und Skeptiker-Agenten einrichten.",
        thirtyDays: "Erste Alpha-Version für 5 vertrauenswürdige Tester für Feedback bereitstellen."
      }
    }
  },
  Spanish: {
    default: {
      score: 78,
      isDemo: true,
      language: 'Spanish',
      recommendation: "Proceda con un enfoque medido y gradual. La oportunidad es real, pero la complejidad de la ejecución requiere una gestión cuidadosa.",
      diagnosis: {
        coreProblem: "Expansión estratégica en territorio no probado.",
        blindSpots: "Sobreestimar la velocidad interna y subestimar la respuesta de la competencia.",
        keyRisks: "El Escéptico advierte sobre el alto consumo de recursos y la posible dilución de la marca si el MVP no ofrece un valor premium."
      },
      paths: {
        safe: {
          description: "Mantener la trayectoria actual mientras se realizan experimentos de bajo costo.",
          pros: ["Cero riesgo de capital", "Enfoque del equipo preservado"],
          cons: ["Pérdida de oportunidad de mercado", "Estancamiento"]
        },
        balanced: {
          description: "El camino recomendado por el Operador: Despliegue gradual durante 12 semanas.",
          pros: ["Gasto controlado", "Retroalimentación más rápida"],
          cons: ["Tensión moderada de recursos"]
        },
        bold: {
          description: "La visión del Estratega: Giro agresivo para capturar el mercado de inmediato.",
          pros: ["Ventaja del primer movimiento", "Alto ROI potencial"],
          cons: ["Riesgo de resultado binario", "Gasto máximo"]
        }
      },
      contrarianInsight: {
        perspective: "¿Qué pasa si el mercado no quiere un sistema operativo, sino solo una mejor herramienta individual?",
        hiddenOpportunity: "Dominio del nicho en el segmento de 'Fundadores' antes de expandirse.",
        uncomfortableTruth: "Es posible que su equipo actual no tenga la experiencia específica en IA para un motor a escala completa."
      },
      futureSimulation: {
        threeMonths: "La retroalimentación temprana confirma el valor central, pero la complejidad de la interfaz es un obstáculo.",
        twelveMonths: "SolveOS se convierte en el estándar para decisiones de alto nivel en empresas medianas."
      },
      actionPlan: {
        today: "Cerrar la especificación del MVP al final del día y definir métricas de éxito.",
        thisWeek: "Configurar los nodos principales de LangGraph para los agentes Estratega y Escéptico.",
        thirtyDays: "Desplegar la alfa inicial a 5 evaluadores de confianza para obtener comentarios."
      }
    }
  },
  Arabic: {
    default: {
      score: 78,
      isDemo: true,
      language: 'Arabic',
      recommendation: "المضي قدماً بنهج مدروس ومرحلي. الفرصة حقيقية، لكن تعقيد التنفيذ يتطلب إدارة دقيقة.",
      diagnosis: {
        coreProblem: "التوسع الاستراتيجي في منطقة غير مثبتة.",
        blindSpots: "المبالغة في تقدير السرعة الداخلية والتقليل من استجابة المنافسين.",
        keyRisks: "المشكك يحذر من استنزاف الموارد العالي واحتمال تراجع قيمة العلامة التجارية إذا فشل النموذج الأولي في تقديم قيمة ممتازة."
      },
      paths: {
        safe: {
          description: "الحفاظ على المسار الحالي مع إجراء تجارب منخفضة التكلفة.",
          pros: ["لا توجد مخاطر رأسمالية", "الحفاظ على تركيز الفريق"],
          cons: ["خسارة فرصة السوق", "الركود"]
        },
        balanced: {
          description: "المسار الموصى به من قبل المشغل: طرح مرحلي على مدار 12 أسبوعاً.",
          pros: ["حرق موارد محكوم", "تعليقات أسرع"],
          cons: ["ضغط متوسط على الموارد"]
        },
        bold: {
          description: "رؤية الاستراتيجي: تحول هجومي للسيطرة على السوق فوراً.",
          pros: ["ميزة المحرك الأول", "عائد استثمار محتمل مرتفع"],
          cons: ["مخاطر النتائج الثنائية", "أقصى حرق للموارد"]
        }
      },
      contrarianInsight: {
        perspective: "ماذا لو لم يكن السوق يريد نظام تشغيل، بل مجرد أداة فردية أفضل؟",
        hiddenOpportunity: "الهيمنة على قطاع 'المؤسسين' قبل التوسع بشكل عام.",
        uncomfortableTruth: "قد لا يمتلك فريقك الحالي خبرة الذكاء الاصطناعي المحددة لمحرك كامل النطاق."
      },
      futureSimulation: {
        threeMonths: "تؤكد التعليقات المبكرة القيمة الأساسية، لكن تعقيد واجهة المستخدم يمثل عقبة.",
        twelveMonths: "تصبح SolveOS هي المعيار للقرارات عالية المخاطر في الشركات المتوسطة."
      },
      actionPlan: {
        today: "تحديد مواصفات النموذج الأولي بنهاية اليوم وتحديد مقاييس النجاح.",
        thisWeek: "إعداد عقد LangGraph الأساسية لوكلاء الاستراتيجي والمشكك.",
        thirtyDays: "نشر النسخة التجريبية الأولى لـ 5 مختبرين موثوقين للحصول على تعليقات."
      }
    }
  },
  Chinese: {
    default: {
      score: 78,
      isDemo: true,
      language: 'Chinese',
      recommendation: "采取慎重、分阶段的方法。机会是真实的，但执行的复杂性需要仔细管理。",
      diagnosis: {
        coreProblem: "向未经验证的领域进行战略扩张。",
        blindSpots: "高估内部速度，低估竞争对手的反应。",
        keyRisks: "怀疑论者警告说，如果 MVP 未能提供溢价价值，可能会导致高资源消耗和潜在的品牌稀释。"
      },
      paths: {
        safe: {
          description: "在进行低成本实验的同时保持目前的轨迹。",
          pros: ["零资本风险", "保持团队专注"],
          cons: ["失去市场机会", "停滞不前"]
        },
        balanced: {
          description: "操作员推荐的路径：在 12 周内分阶段推出。",
          pros: ["受控的资金消耗", "更快的反馈"],
          cons: ["中等资源压力"]
        },
        bold: {
          description: "战略家的愿景：激进转型，立即占领市场。",
          pros: ["先发优势", "潜在的高投资回报率"],
          cons: ["二元结果风险", "最大资金消耗"]
        }
      },
      contrarianInsight: {
        perspective: "如果市场不想要操作系统，而只是一个更好的单一工具怎么办？",
        hiddenOpportunity: "在广泛推广之前，先在“创始人”细分市场占据主导地位。",
        uncomfortableTruth: "您目前的团队可能不具备构建全规模引擎所需的特定 AI 专业知识。"
      },
      futureSimulation: {
        threeMonths: "早期反馈确认了核心价值，但 UI 复杂性是一个障碍。",
        twelveMonths: "SolveOS 成为中型市场公司高风险决策的标准。"
      },
      actionPlan: {
        today: "在今日结束前敲定 MVP 规范并定义成功指标。",
        thisWeek: "为战略家和怀疑论者代理设置核心 LangGraph 节点。",
        thirtyDays: "向 5 位值得信赖的测试人员发布初始测试版以获取反馈。"
      }
    }
  }
};

export function getMockBlueprint(problem: string, language: string = 'English'): any {
  // Ensure we use a supported language for the mock, fallback to English
  const langKey = MOCK_RESPONSES[language] ? language : 'English';
  const dataset = MOCK_RESPONSES[langKey];
  
  const p = problem.toLowerCase();
  // We could add more specific keyword matching per language if needed
  if (p.includes('cto') || p.includes('директор') || p.includes('technischer')) {
    // For simplicity, returning localized default or a specific localized mock if we built them
    return dataset.default; 
  }
  
  return dataset.default;
}
