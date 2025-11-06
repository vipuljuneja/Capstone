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
const MediaJobSchema = new mongoose_1.Schema({
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
    questionOrder: {
        type: Number,
        required: true
    },
    provider: {
        type: String,
        required: true,
        default: 'did'
    },
    jobId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    status: {
        type: String,
        enum: ['queued', 'rendering', 'uploaded', 'published', 'failed'],
        default: 'queued',
        index: true
    },
    requestedAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    error: {
        type: String,
        default: null
    },
    source: {
        image: {
            bucket: {
                type: String,
                required: true
            },
            key: {
                type: String,
                required: true
            }
        },
        voiceId: {
            type: String,
            required: true
        },
        promptText: {
            type: String,
            required: true
        }
    },
    output: {
        type: {
            bucket: String,
            key: String
        },
        default: null
    }
}, {
    timestamps: true
});
// Indexes for job tracking and querying
MediaJobSchema.index({ status: 1, requestedAt: 1 });
MediaJobSchema.index({ scenarioId: 1, level: 1, questionOrder: 1 });
exports.default = mongoose_1.default.model('MediaJob', MediaJobSchema);
//# sourceMappingURL=MediaJob.js.map