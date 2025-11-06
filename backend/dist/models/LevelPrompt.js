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
const LevelPromptSchema = new mongoose_1.Schema({
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
    introScript: {
        type: String,
        required: true,
        trim: true
    },
    questionSet: [
        {
            order: {
                type: Number,
                required: true
            },
            text: {
                type: String,
                required: true,
                trim: true
            },
            media: {
                type: {
                    type: String,
                    enum: ['avatar_video', 'image', 'audio'],
                    required: true
                },
                bucket: {
                    type: String,
                    required: true
                },
                key: {
                    type: String,
                    required: true
                },
                provider: {
                    type: String,
                    required: true
                },
                jobId: {
                    type: String
                }
            }
        }
    ],
    rubric: {
        pace: {
            targetWpm: {
                type: [Number],
                required: true
            }
        },
        fillers: {
            maxPerMin: {
                type: Number,
                required: true
            },
            keywords: {
                type: [String],
                required: true
            }
        },
        pauses: {
            minCount: {
                type: Number,
                required: true
            },
            maxCount: {
                type: Number,
                required: true
            }
        },
        tone: {
            neutrality: {
                type: [Number],
                required: true
            },
            warmth: {
                type: String,
                required: true
            }
        },
        eyeContact: {
            enabled: {
                type: Boolean,
                default: false
            }
        },
        smile: {
            enabled: {
                type: Boolean,
                default: false
            }
        },
        completion: {
            requiredSteps: {
                type: [Number],
                required: true
            }
        }
    },
    aiSystemPrompt: {
        type: String,
        required: true
    },
    aiScoringPrompt: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
// Compound index for quick level lookup
LevelPromptSchema.index({ scenarioId: 1, level: 1 }, { unique: true });
exports.default = mongoose_1.default.model('LevelPrompt', LevelPromptSchema);
//# sourceMappingURL=LevelPrompt.js.map