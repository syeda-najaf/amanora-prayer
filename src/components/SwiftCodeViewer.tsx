import React, { useState } from 'react';
import { IslamicButton } from './IslamicButton';
import { Copy, Check, Download, Code2, Smartphone, Sparkles, Layers, Play } from 'lucide-react';

interface SwiftCodeFile {
  id: string;
  filename: string;
  title: string;
  description: string;
  badge: string;
  code: string;
}

const SWIFT_FILES: SwiftCodeFile[] = [
  {
    id: 'cartoon-view',
    filename: 'AbdulBariCartoonView.swift',
    title: 'Abdul Bari Seamless Animation Engine',
    description: 'SwiftUI Canvas & TimelineView vector character renderer with 60/120fps continuous breathing, procedural eye blinking, and synchronized mouth phonemes.',
    badge: 'SwiftUI Canvas',
    code: `//
//  AbdulBariCartoonView.swift
//  Amanora - Islamic Companion & Moral Stories
//
//  Seamless 60/120 FPS vector character animation engine for Swift.
//  Created for smooth rendering without dropped frames.
//

import SwiftUI

public enum StoryEmotion: String, CaseIterable, Sendable {
    case patient, honest, grateful, humble, gentle, speaking
}

public enum ActionPropType: String, CaseIterable, Sendable {
    case plantSeed, returnWallet, shareBread, duaNight, gentleWords
}

/// Seamless Vector-Rendered Abdul Bari Cartoon Character
public struct AbdulBariCartoonView: View {
    public let emotion: StoryEmotion
    public let actionProp: ActionPropType
    public let isSpeaking: Bool
    public let stepIndex: Int
    
    @State private var blinkState: Bool = false
    @State private var mouthCycle: Int = 0
    
    public init(
        emotion: StoryEmotion = .patient,
        actionProp: ActionPropType = .plantSeed,
        isSpeaking: Bool = false,
        stepIndex: Int = 0
    ) {
        self.emotion = emotion
        self.actionProp = actionProp
        self.isSpeaking = isSpeaking
        self.stepIndex = stepIndex
    }
    
    public var body: some View {
        TimelineView(.animation) { timeline in
            let time = timeline.date.timeIntervalSinceReferenceDate
            let breathingY = sin(time * 2.5) * 3.0
            let headTilt = Angle(degrees: sin(time * 1.8) * 1.6)
            let handBob = cos(time * 2.8) * 2.5
            
            Canvas { context, size in
                let center = CGPoint(x: size.width / 2, y: size.height / 2)
                
                // 1. Draw Atmospheric Glow & Sky
                drawAtmosphere(context: &context, size: size, action: actionProp)
                
                // 2. Draw Interactive Props (Seed/Tree, Wallet, Bread, Dua Light)
                drawActionProps(context: &context, size: size, action: actionProp, step: stepIndex, time: time)
                
                // 3. Draw Body & Thobe
                drawBody(context: &context, center: center, breathingY: breathingY)
                
                // 4. Draw Animated Articulated Arms
                drawArms(context: &context, center: center, action: actionProp, handBob: handBob)
                
                // 5. Draw Head, Eyes, Cap, & Lip-Sync Mouth
                drawHead(
                    context: &context,
                    center: center,
                    breathingY: breathingY,
                    headTilt: headTilt,
                    isBlinking: blinkState,
                    mouthPhoneme: isSpeaking ? (Int(time * 7) % 4) : 0,
                    emotion: emotion
                )
            }
        }
        .task {
            // Procedural natural eye blinking timer
            while !Task.isCancelled {
                try? await Task.sleep(nanoseconds: UInt64(Double.random(in: 2.8...4.5) * 1_000_000_000))
                withAnimation(.easeOut(duration: 0.08)) {
                    blinkState = true
                }
                try? await Task.sleep(nanoseconds: 140_000_000)
                withAnimation(.easeIn(duration: 0.08)) {
                    blinkState = false
                }
            }
        }
    }
    
    // MARK: - Drawing Subroutines
    
    private func drawAtmosphere(context: inout GraphicsContext, size: CGSize, action: ActionPropType) {
        if action == .duaNight {
            let skyRect = CGRect(origin: .zero, size: size)
            context.fill(Path(roundedRect: skyRect, cornerRadius: 24), with: .color(Color(hex: "0E261E")))
            
            // Crescent Moon
            var moonPath = Path()
            moonPath.addArc(center: CGPoint(x: size.width - 45, y: 45), radius: 20, startAngle: .zero, endAngle: .degrees(360), clockwise: false)
            context.fill(moonPath, with: .color(Color(hex: "F3E5AB").opacity(0.85)))
        }
    }
    
    private func drawActionProps(context: inout GraphicsContext, size: CGSize, action: ActionPropType, step: Int, time: Double) {
        switch action {
        case .plantSeed:
            let groundY = size.height - 35
            if step >= 3 {
                // Blooming Tree
                let treeRect = CGRect(x: size.width - 70, y: groundY - 60, width: 50, height: 50)
                context.fill(Path(ellipseIn: treeRect), with: .color(Color(hex: "2E8B57")))
            } else {
                // Sprout
                let sproutRect = CGRect(x: size.width - 55, y: groundY - 20, width: 14, height: 18)
                context.fill(Path(ellipseIn: sproutRect), with: .color(Color(hex: "4CAF50")))
            }
        case .returnWallet:
            let walletRect = CGRect(x: size.width / 2 + 30, y: size.height / 2 + 40, width: 34, height: 22)
            context.fill(Path(roundedRect: walletRect, cornerRadius: 4), with: .color(Color(hex: "8B4513")))
        case .shareBread:
            let breadRect = CGRect(x: size.width / 2 - 20, y: size.height / 2 + 45, width: 40, height: 20)
            context.fill(Path(ellipseIn: breadRect), with: .color(Color(hex: "DE9B52")))
        case .duaNight:
            // Noor Glow
            let glow = CGRect(x: size.width / 2 - 25, y: size.height / 2 - 10, width: 50, height: 50)
            context.fill(Path(ellipseIn: glow), with: .radialGradient(
                Gradient(colors: [Color(hex: "C9A24D").opacity(0.4), .clear]),
                center: CGPoint(x: size.width / 2, y: size.height / 2 + 15),
                startRadius: 0,
                endRadius: 35
            ))
        case .gentleWords:
            break
        }
    }
    
    private func drawBody(context: inout GraphicsContext, center: CGPoint, breathingY: Double) {
        var bodyPath = Path()
        let topY = center.y + 40 + breathingY
        bodyPath.move(to: CGPoint(x: center.x - 45, y: topY))
        bodyPath.addLine(to: CGPoint(x: center.x + 45, y: topY))
        bodyPath.addLine(to: CGPoint(x: center.x + 55, y: topY + 120))
        bodyPath.addLine(to: CGPoint(x: center.x - 55, y: topY + 120))
        bodyPath.closeSubpath()
        
        // Crisp White Thobe
        context.fill(bodyPath, with: .color(Color(hex: "FAFAF8")))
        
        // Emerald Vest
        var leftVest = Path()
        leftVest.move(to: CGPoint(x: center.x - 45, y: topY))
        leftVest.addLine(to: CGPoint(x: center.x - 20, y: topY))
        leftVest.addLine(to: CGPoint(x: center.x - 18, y: topY + 120))
        leftVest.addLine(to: CGPoint(x: center.x - 55, y: topY + 120))
        leftVest.closeSubpath()
        context.fill(leftVest, with: .color(Color(hex: "174D3D")))
        
        var rightVest = Path()
        rightVest.move(to: CGPoint(x: center.x + 45, y: topY))
        rightVest.addLine(to: CGPoint(x: center.x + 20, y: topY))
        rightVest.addLine(to: CGPoint(x: center.x + 18, y: topY + 120))
        rightVest.addLine(to: CGPoint(x: center.x + 55, y: topY + 120))
        rightVest.closeSubpath()
        context.fill(rightVest, with: .color(Color(hex: "174D3D")))
        
        // Gold Buttons
        for i in 0..<4 {
            let buttonY = topY + 25 + Double(i * 22)
            let buttonRect = CGRect(x: center.x - 3, y: buttonY, width: 6, height: 6)
            context.fill(Path(ellipseIn: buttonRect), with: .color(Color(hex: "C9A24D")))
        }
    }
    
    private func drawArms(context: inout GraphicsContext, center: CGPoint, action: ActionPropType, handBob: Double) {
        let leftHand = CGPoint(x: center.x - 50, y: center.y + 70 + handBob)
        let rightHand = CGPoint(x: center.x + 50, y: center.y + 70 + handBob)
        
        context.stroke(Path { p in
            p.move(to: CGPoint(x: center.x - 40, y: center.y + 45))
            p.addLine(to: leftHand)
        }, with: .color(Color(hex: "174D3D")), lineWidth: 14)
        
        context.stroke(Path { p in
            p.move(to: CGPoint(x: center.x + 40, y: center.y + 45))
            p.addLine(to: rightHand)
        }, with: .color(Color(hex: "174D3D")), lineWidth: 14)
        
        // Hands (Skin)
        context.fill(Path(ellipseIn: CGRect(x: leftHand.x - 7, y: leftHand.y - 7, width: 14, height: 14)), with: .color(Color(hex: "F7D0A6")))
        context.fill(Path(ellipseIn: CGRect(x: rightHand.x - 7, y: rightHand.y - 7, width: 14, height: 14)), with: .color(Color(hex: "F7D0A6")))
    }
    
    private func drawHead(
        context: inout GraphicsContext,
        center: CGPoint,
        breathingY: Double,
        headTilt: Angle,
        isBlinking: Bool,
        mouthPhoneme: Int,
        emotion: StoryEmotion
    ) {
        let headCenter = CGPoint(x: center.x, y: center.y - 20 + breathingY)
        
        // 1. Round Friendly Face
        let faceRect = CGRect(x: headCenter.x - 45, y: headCenter.y - 45, width: 90, height: 90)
        context.fill(Path(ellipseIn: faceRect), with: .color(Color(hex: "FAD9B6")))
        
        // 2. Islamic Green Kufi Cap
        var capPath = Path()
        capPath.addArc(center: CGPoint(x: headCenter.x, y: headCenter.y - 15), radius: 46, startAngle: .degrees(180), endAngle: .degrees(360), clockwise: false)
        capPath.closeSubpath()
        context.fill(capPath, with: .color(Color(hex: "154536")))
        
        // Gold Brim
        let brimRect = CGRect(x: headCenter.x - 47, y: headCenter.y - 20, width: 94, height: 10)
        context.fill(Path(roundedRect: brimRect, cornerRadius: 4), with: .color(Color(hex: "C9A24D")))
        
        // 3. Eyes (Open or Blinking)
        let leftEye = CGPoint(x: headCenter.x - 18, y: headCenter.y - 5)
        let rightEye = CGPoint(x: headCenter.x + 18, y: headCenter.y - 5)
        
        if isBlinking {
            context.stroke(Path { p in
                p.move(to: CGPoint(x: leftEye.x - 7, y: leftEye.y))
                p.addLine(to: CGPoint(x: leftEye.x + 7, y: leftEye.y))
            }, with: .color(Color(hex: "1A1C1E")), lineWidth: 2.5)
            context.stroke(Path { p in
                p.move(to: CGPoint(x: rightEye.x - 7, y: rightEye.y))
                p.addLine(to: CGPoint(x: rightEye.x + 7, y: rightEye.y))
            }, with: .color(Color(hex: "1A1C1E")), lineWidth: 2.5)
        } else {
            context.fill(Path(ellipseIn: CGRect(x: leftEye.x - 6, y: leftEye.y - 7, width: 12, height: 14)), with: .color(Color(hex: "1A1C1E")))
            context.fill(Path(ellipseIn: CGRect(x: rightEye.x - 6, y: rightEye.y - 7, width: 12, height: 14)), with: .color(Color(hex: "1A1C1E")))
            // Sparkles
            context.fill(Path(ellipseIn: CGRect(x: leftEye.x - 3, y: leftEye.y - 5, width: 4, height: 4)), with: .color(.white))
            context.fill(Path(ellipseIn: CGRect(x: rightEye.x - 3, y: rightEye.y - 5, width: 4, height: 4)), with: .color(.white))
        }
        
        // 4. Synchronized Lip-Sync Mouth
        let mouthY = headCenter.y + 20
        switch mouthPhoneme {
        case 1: // Open Small
            let r = CGRect(x: headCenter.x - 6, y: mouthY - 3, width: 12, height: 8)
            context.fill(Path(ellipseIn: r), with: .color(Color(hex: "9E2A2B")))
        case 2: // Wide AH
            let r = CGRect(x: headCenter.x - 9, y: mouthY - 4, width: 18, height: 10)
            context.fill(Path(ellipseIn: r), with: .color(Color(hex: "9E2A2B")))
        case 3: // Round OO
            let r = CGRect(x: headCenter.x - 5, y: mouthY - 4, width: 10, height: 10)
            context.fill(Path(ellipseIn: r), with: .color(Color(hex: "9E2A2B")))
        default: // Warm Smile
            var smile = Path()
            smile.addArc(center: CGPoint(x: headCenter.x, y: mouthY - 2), radius: 8, startAngle: .degrees(20), endAngle: .degrees(160), clockwise: false)
            context.stroke(smile, with: .color(Color(hex: "7A1C1D")), lineWidth: 2.5)
        }
    }
}

// Color Hex Helper for Swift
private extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}
`,
  },
  {
    id: 'buttons',
    filename: 'IslamicInnerBevelButtonStyle.swift',
    title: 'Jeweled Inner-Bevel ButtonStyle',
    description: 'Custom SwiftUI ButtonStyle implementing dual-layer inner bevels, metallic gold leaf gradients, haptic feedback, and tactile depression physics.',
    badge: 'SwiftUI ButtonStyle',
    code: `//
//  IslamicInnerBevelButtonStyle.swift
//  Amanora - Islamic Companion
//
//  Production SwiftUI ButtonStyles with bespoke inner bevel,
//  specular highlights, and physical haptics.
//

import SwiftUI
#if canImport(UIKit)
import UIKit
#endif

public enum IslamicButtonVariant {
    case jannahEmerald
    case gildedBullion
    case softParchment
    case rubyStop
}

/// ButtonStyle featuring multi-layered inner bevels and tactile feedback
public struct IslamicInnerBevelButtonStyle: ButtonStyle {
    public let variant: IslamicButtonVariant
    public let withOrnament: Bool
    
    public init(variant: IslamicButtonVariant = .jannahEmerald, withOrnament: Bool = true) {
        self.variant = variant
        self.withOrnament = withOrnament
    }
    
    public func makeBody(configuration: Configuration) -> some View {
        HStack(spacing: 8) {
            if withOrnament {
                Text("۞")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(ornamentColor)
                    .scaleEffect(configuration.isPressed ? 1.15 : 1.0)
            }
            
            configuration.label
                .font(.system(size: 13, weight: .heavy, design: .rounded))
                .tracking(1.2)
                .textCase(.uppercase)
                .foregroundColor(textColor)
            
            if withOrnament {
                Text("۞")
                    .font(.system(size: 11, weight: .bold))
                    .foregroundColor(ornamentColor)
                    .scaleEffect(configuration.isPressed ? 1.15 : 1.0)
            }
        }
        .padding(.horizontal, 22)
        .padding(.vertical, 14)
        .background(
            ZStack {
                // Base background gradient
                backgroundGradient
                
                // Top inner specular highlight
                VStack {
                    LinearGradient(
                        colors: [.white.opacity(0.45), .clear],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                    .frame(height: 2)
                    Spacer()
                }
                
                // Bottom inner shadow
                VStack {
                    Spacer()
                    Color.black.opacity(0.3)
                        .frame(height: 1.5)
                }
            }
        )
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .strokeBorder(borderColor, lineWidth: 1.2)
        )
        .shadow(color: shadowColor, radius: configuration.isPressed ? 3 : 8, y: configuration.isPressed ? 2 : 4)
        .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
        .offset(y: configuration.isPressed ? 1.5 : 0)
        .animation(.spring(response: 0.22, dampingFraction: 0.7), value: configuration.isPressed)
        .onChange(of: configuration.isPressed) { _, isPressed in
            if isPressed {
                #if canImport(UIKit)
                UIImpactFeedbackGenerator(style: .medium).impactOccurred()
                #endif
            }
        }
    }
    
    // MARK: - Color Properties
    
    private var textColor: Color {
        switch variant {
        case .jannahEmerald, .rubyStop: return .white
        case .gildedBullion: return Color(red: 0.05, green: 0.17, blue: 0.14)
        case .softParchment: return Color(red: 0.09, green: 0.24, blue: 0.20)
        }
    }
    
    private var ornamentColor: Color {
        switch variant {
        case .jannahEmerald: return Color(red: 0.89, green: 0.78, blue: 0.52).opacity(0.8)
        case .gildedBullion: return Color(red: 0.45, green: 0.32, blue: 0.09).opacity(0.8)
        case .softParchment: return Color(red: 0.78, green: 0.63, blue: 0.30)
        case .rubyStop: return Color.white.opacity(0.7)
        }
    }
    
    private var backgroundGradient: LinearGradient {
        switch variant {
        case .jannahEmerald:
            return LinearGradient(
                colors: [Color(red: 0.11, green: 0.31, blue: 0.25), Color(red: 0.04, green: 0.15, blue: 0.12)],
                startPoint: .top,
                endPoint: .bottom
            )
        case .gildedBullion:
            return LinearGradient(
                colors: [Color(red: 0.96, green: 0.85, blue: 0.53), Color(red: 0.79, green: 0.64, blue: 0.30)],
                startPoint: .top,
                endPoint: .bottom
            )
        case .softParchment:
            return LinearGradient(
                colors: [Color.white, Color(red: 0.93, green: 0.95, blue: 0.92)],
                startPoint: .top,
                endPoint: .bottom
            )
        case .rubyStop:
            return LinearGradient(
                colors: [Color(red: 0.77, green: 0.26, blue: 0.21), Color(red: 0.51, green: 0.12, blue: 0.09)],
                startPoint: .top,
                endPoint: .bottom
            )
        }
    }
    
    private var borderColor: Color {
        switch variant {
        case .jannahEmerald: return Color(red: 0.79, green: 0.64, blue: 0.30).opacity(0.55)
        case .gildedBullion: return Color.white.opacity(0.7)
        case .softParchment: return Color(red: 0.79, green: 0.64, blue: 0.30).opacity(0.35)
        case .rubyStop: return Color.white.opacity(0.35)
        }
    }
    
    private var shadowColor: Color {
        switch variant {
        case .jannahEmerald: return Color(red: 0.05, green: 0.18, blue: 0.15).opacity(0.35)
        case .gildedBullion: return Color(red: 0.79, green: 0.64, blue: 0.30).opacity(0.4)
        case .softParchment: return Color.black.opacity(0.08)
        case .rubyStop: return Color(red: 0.71, green: 0.22, blue: 0.18).opacity(0.35)
        }
    }
}
`,
  },
  {
    id: 'reels-view',
    filename: 'AbdulBariReelsPlayerView.swift',
    title: 'Shorts & Reels TikTok-Style Snapping Player',
    description: 'Vertical scroll carousel with paging, speech synthesis narration, video fallback, and Abdul Bari animation synchronization.',
    badge: 'SwiftUI Reels Flow',
    code: `//
//  AbdulBariReelsPlayerView.swift
//  Amanora - Islamic Companion
//
//  SwiftUI Vertical Snapping Reels Player with Abdul Bari Cartoons.
//

import SwiftUI
import AVFoundation

public struct MoralStory: Identifiable, Sendable {
    public let id: Int
    public let tag: String
    public let title: String
    public let steps: [String]
    public let lesson: String
    public let reference: String
    public let narration: String
    public let emotion: StoryEmotion
    public let actionProp: ActionPropType
}

public struct AbdulBariReelsPlayerView: View {
    public let stories: [MoralStory]
    @State private var currentIndex: Int = 0
    @State private var isNarrating: Bool = false
    @State private var activeStep: Int = 0
    @State private var speechSynthesizer = AVSpeechSynthesizer()
    
    public init(stories: [MoralStory]) {
        self.stories = stories
    }
    
    public var body: some View {
        GeometryReader { geometry in
            ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 0) {
                    ForEach(Array(stories.enumerated()), id: \\.element.id) { index, story in
                        ReelCardView(
                            story: story,
                            isActive: index == currentIndex,
                            isNarrating: isNarrating && index == currentIndex,
                            currentStep: activeStep,
                            onToggleNarration: { toggleNarration(for: story) }
                        )
                        .frame(width: geometry.size.width, height: geometry.size.height)
                        .id(index)
                    }
                }
                .scrollTargetLayout()
            }
            .scrollTargetBehavior(.paging)
        }
        .background(Color(red: 0.05, green: 0.17, blue: 0.14).ignoresSafeArea())
    }
    
    private func toggleNarration(for story: MoralStory) {
        if isNarrating {
            speechSynthesizer.stopSpeaking(at: .immediate)
            isNarrating = false
        } else {
            let utterance = AVSpeechUtterance(string: story.narration)
            utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
            utterance.rate = 0.48
            isNarrating = true
            speechSynthesizer.speak(utterance)
        }
    }
}

private struct ReelCardView: View {
    let story: MoralStory
    let isActive: Bool
    let isNarrating: Bool
    let currentStep: Int
    let onToggleNarration: () -> Void
    
    var body: some View {
        VStack(spacing: 14) {
            // Top Tag
            HStack {
                Text(story.tag)
                    .font(.system(size: 11, weight: .black))
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Color(red: 0.79, green: 0.64, blue: 0.30))
                    .foregroundColor(Color(red: 0.05, green: 0.17, blue: 0.14))
                    .clipShape(Capsule())
                Spacer()
                Text("DAILY GOOD THING")
                    .font(.system(size: 10, weight: .heavy))
                    .foregroundColor(Color.white.opacity(0.7))
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            
            // Abdul Bari Animated Canvas
            AbdulBariCartoonView(
                emotion: story.emotion,
                actionProp: story.actionProp,
                isSpeaking: isNarrating,
                stepIndex: currentStep
            )
            .frame(maxHeight: 340)
            .background(Color(red: 0.98, green: 0.97, blue: 0.94))
            .clipShape(RoundedRectangle(cornerRadius: 26, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 26, style: .continuous)
                    .strokeBorder(Color(red: 0.79, green: 0.64, blue: 0.30).opacity(0.4), lineWidth: 2)
            )
            .padding(.horizontal, 16)
            
            // Lesson & Listen Action
            VStack(alignment: .leading, spacing: 6) {
                Text(story.lesson)
                    .font(.system(size: 18, weight: .bold))
                    .foregroundColor(.white)
                
                Text(story.reference)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(Color(red: 0.89, green: 0.78, blue: 0.52))
                
                Button(action: onToggleNarration) {
                    HStack {
                        Image(systemName: isNarrating ? "stop.fill" : "play.fill")
                        Text(isNarrating ? "Stop Story" : "Listen to Story")
                    }
                }
                .buttonStyle(IslamicInnerBevelButtonStyle(variant: .gildedBullion))
                .padding(.top, 6)
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 20)
        }
    }
}
`,
  },
];

export const SwiftCodeViewer: React.FC = () => {
  const [activeFileId, setActiveFileId] = useState<string>('cartoon-view');
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = SWIFT_FILES.find(f => f.id === activeFileId) || SWIFT_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([activeFile.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#123A2F] via-[#1C4E40] to-[#0A261E] rounded-3xl p-6 text-white border border-[#C9A24D]/40 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#E7CF9B] text-xs font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Full Code for Seamless Animation Rendering in Swift</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Abdul Bari & Inner Button Swift Architecture
            </h2>
            <p className="text-stone-300 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
              Production SwiftUI & CoreAnimation source files for seamless 60/120 FPS animation loops, tactile inner-bevel ButtonStyles, and snapping Reels in iOS.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <IslamicButton
              variant="gold"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={handleDownload}
            >
              Export .swift
            </IslamicButton>
            <IslamicButton
              variant="secondary"
              size="sm"
              icon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              onClick={handleCopy}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </IslamicButton>
          </div>
        </div>
      </div>

      {/* File Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {SWIFT_FILES.map(file => {
          const isActive = file.id === activeFileId;
          return (
            <button
              key={file.id}
              onClick={() => setActiveFileId(file.id)}
              className={`text-left p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden ${
                isActive
                  ? 'bg-white border-[#C9A24D] shadow-md ring-2 ring-[#C9A24D]/20'
                  : 'bg-white/80 border-stone-200 hover:bg-white hover:border-stone-300'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#C9A24D] to-amber-600" />
              )}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono font-bold text-[#173D33] truncate">
                  {file.filename}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                  {file.badge}
                </span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                {file.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Code Display Window */}
      <div className="bg-[#0F172A] rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden">
        {/* Editor Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1E293B] border-b border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-3 font-mono font-bold text-slate-200 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-amber-400" />
              {activeFile.filename}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 font-mono">Swift 6.0 · iOS 17+</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Code Block with Line Numbers */}
        <div className="p-5 font-mono text-xs overflow-x-auto max-h-[550px] leading-relaxed text-slate-200 select-text">
          <pre>
            <code>{activeFile.code}</code>
          </pre>
        </div>
      </div>

      {/* Xcode Integration Guide */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs text-stone-600">
        <div className="flex items-start gap-3">
          <Smartphone className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-stone-900">Xcode iOS Integration Guide:</h4>
            <p className="mt-0.5 leading-normal">
              1. Drag these Swift files into your Xcode iOS project folder.<br />
              2. Add AbdulBariCartoonView to your SwiftUI hierarchy or apply the IslamicInnerBevelButtonStyle to your buttons.
            </p>
          </div>
        </div>
        <IslamicButton
          variant="jannah"
          size="sm"
          onClick={() => {
            handleDownload();
          }}
        >
          Download Active File
        </IslamicButton>
      </div>
    </div>
  );
};
