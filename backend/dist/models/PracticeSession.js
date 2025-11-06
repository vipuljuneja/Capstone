"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const PracticeSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    scenarioId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Scenario',
        required: true,
        index: true
    },
    level: {
        type: Number,
        required: true,
        min: 1,
        max: 3
    },
    status: {
        type: String,
        enum: ['active', 'abandoned', 'completed'],
        default: 'active',
        index: true
    },
    steps: [
        {
            order: {
                type: Number,
                required: true
            },
            startedAt: {
                type: Date,
                required: true
            },
            endedAt: {
                type: Date,
                required: true
            },
            transcript: {
                type: String,
                required: true
            },
            metrics: {
                durationSec: Number,
                wpm: Number,
                fillers: [
                    {
                        word: String,
                        t: Number
                    }
                ],
                pauses: [
                    {
                        t: Number,
                        len: Number
                    }
                ],
                tone: {
                    score: Number,
                    labels: [String]
                },
                eyeContact: {
                    available: Boolean,
                    ratio: {
                        type: Number,
                        default: null
                    }
                },
                smile: {
                    ratio: {
                        type: Number,
                        default: null
                    }
                }
            }
        }
    ],
    aggregate: {
        wpmAvg: {
            type: Number,
            default: 0
        },
        fillersPerMin: {
            type: Number,
            default: 0
        },
        toneScore: {
            type: Number,
            default: 0
        },
        eyeContactRatio: {
            type: Number,
            default: null
        },
        score: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        }
    },
    facialAnalysis: {
        type: {
            summary: {
                overallScore: Number,
                level: String,
                totalFrames: Number,
                duration: Number,
                timestamp: Date
            },
            scores: {
                eyeContact: Number,
                posture: Number,
                expressiveness: Number,
                composure: Number,
                naturalness: Number
            },
            detailedMetrics: {
                eyeRolls: {
                    count: Number,
                    details: [
                        {
                            frameIndex: Number,
                            timestamp: Number,
                            intensity: Number,
                            lookUpValue: Number
                        }
                    ]
                },
                blinking: {
                    total: Number,
                    perMinute: Number,
                    isExcessive: Boolean
                },
                gaze: {
                    stabilityScore: Number,
                    isStable: Boolean
                },
                smiles: {
                    percentage: Number,
                    genuine: Number,
                    forced: Number,
                    authenticityRatio: Number
                },
                tension: {
                    average: Number,
                    max: Number,
                    isHigh: Boolean
                },
                microExpressions: {
                    count: Number,
                    types: mongoose_1.Schema.Types.Mixed
                }
            },
            strengths: [
                {
                    metric: String,
                    score: Number,
                    icon: String,
                    message: String,
                    impact: String
                }
            ],
            weaknesses: [
                {
                    metric: String,
                    score: Number,
                    severity: {
                        type: String,
                        enum: ['low', 'medium', 'high']
                    },
                    icon: String,
                    issue: String,
                    why: String
                }
            ],
            recommendations: [
                {
                    priority: {
                        type: String,
                        enum: ['low', 'medium', 'high']
                    },
                    area: String,
                    issue: String,
                    recommendation: String,
                    exercise: String,
                    impact: String
                }
            ],
            keyInsights: [String]
        },
        default: null
    },
    aiFeedbackCards: [
        {
            title: {
                type: String,
                required: true
            },
            body: {
                type: String,
                required: true
            },
            type: {
                type: String,
                enum: ['tip', 'praise', 'warning'],
                required: true
            }
        }
    ],
    achievementsUnlocked: {
        type: [String],
        default: []
    },
    pipoNoteId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'SelfReflection',
        default: null
        // Links to the Pipo note created from this session
    },
    startedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});
// Indexes for querying user sessions and analytics
PracticeSessionSchema.index({ userId: 1, completedAt: -1 });
PracticeSessionSchema.index({ scenarioId: 1, level: 1 });
PracticeSessionSchema.index({ userId: 1, scenarioId: 1, level: 1 });
exports.default = mongoose_1.default.model('PracticeSession', PracticeSessionSchema);
//# sourceMappingURL=PracticeSession.js.map