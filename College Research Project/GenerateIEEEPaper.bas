
' ============================================================================
' BHISMA IEEE RESEARCH PAPER GENERATOR
' ============================================================================
' Author: Rohit Kandpal
' Purpose: Generates a fully formatted IEEE conference paper for the
'          Bhisma LLM Security Testing Platform
' Usage:   1. Open a blank Word document
'          2. Press Alt+F11 to open VBA Editor
'          3. Insert > Module, paste this code
'          4. Press F5 or run GenerateBhismaPaper()
' ============================================================================

Option Explicit

' ============================================================================
' CONSTANTS - IEEE FORMAT SPECIFICATIONS
' ============================================================================
Private Const FONT_BODY As String = "Times New Roman"
Private Const FONT_SIZE_TITLE As Long = 24
Private Const FONT_SIZE_AUTHOR As Long = 11
Private Const FONT_SIZE_AFFILIATION As Long = 10
Private Const FONT_SIZE_ABSTRACT As Long = 9
Private Const FONT_SIZE_BODY As Long = 10
Private Const FONT_SIZE_HEADING1 As Long = 10
Private Const FONT_SIZE_HEADING2 As Long = 10
Private Const FONT_SIZE_HEADING3 As Long = 10
Private Const FONT_SIZE_CAPTION As Long = 8
Private Const FONT_SIZE_REFERENCE As Long = 8

Private Const MARGIN_TOP As Single = 0.75    ' inches
Private Const MARGIN_BOTTOM As Single = 1    ' inches
Private Const MARGIN_LEFT As Single = 0.625  ' inches
Private Const MARGIN_RIGHT As Single = 0.625 ' inches
Private Const COLUMN_SPACING As Single = 0.2 ' inches

' ============================================================================
' MAIN ENTRY POINT
' ============================================================================
Public Sub GenerateBhismaPaper()
    
    Application.ScreenUpdating = False
    Application.DisplayAlerts = False
    
    Dim doc As Document
    Set doc = ActiveDocument
    
    ' Clear existing content
    doc.Content.Delete
    
    ' Setup IEEE page format
    Call SetupPageFormat(doc)
    
    ' Generate all sections
    Call WriteTitle(doc)
    Call WriteAbstract(doc)
    Call WriteIntroduction(doc)
    Call WriteLiteratureReview(doc)
    Call WriteSystemArchitecture(doc)
    Call WriteMethodology(doc)
    Call WriteImplementation(doc)
    Call WriteResultsAndAnalysis(doc)
    Call WriteDiscussion(doc)
    Call WriteConclusion(doc)
    Call WriteReferences(doc)
    
    ' Final formatting pass
    Call ApplyDoubleColumn(doc)
    
    Application.ScreenUpdating = True
    Application.DisplayAlerts = True
    
    MsgBox "IEEE Research Paper generated successfully!" & vbCrLf & _
           "Total pages: " & doc.ComputeStatistics(wdStatisticPages) & vbCrLf & _
           "Total words: " & doc.ComputeStatistics(wdStatisticWords), _
           vbInformation, "Bhisma Paper Generator"
End Sub

' ============================================================================
' PAGE SETUP
' ============================================================================
Private Sub SetupPageFormat(doc As Document)
    With doc.PageSetup
        .TopMargin = InchesToPoints(MARGIN_TOP)
        .BottomMargin = InchesToPoints(MARGIN_BOTTOM)
        .LeftMargin = InchesToPoints(MARGIN_LEFT)
        .RightMargin = InchesToPoints(MARGIN_RIGHT)
        .PageWidth = InchesToPoints(8.5)
        .PageHeight = InchesToPoints(11)
        .Orientation = wdOrientPortrait
        .HeaderDistance = InchesToPoints(0.3)
        .FooterDistance = InchesToPoints(0.3)
    End With
    
    ' Set default paragraph format
    With doc.Styles(wdStyleNormal).ParagraphFormat
        .SpaceAfter = 0
        .SpaceBefore = 0
        .LineSpacingRule = wdLineSpaceSingle
        .Alignment = wdAlignParagraphJustify
    End With
    
    With doc.Styles(wdStyleNormal).Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_BODY
    End With
End Sub

' ============================================================================
' HELPER: Add formatted text
' ============================================================================
Private Sub AddText(doc As Document, txt As String, fontSize As Long, _
                    isBold As Boolean, isItalic As Boolean, _
                    alignment As WdParagraphAlignment, _
                    Optional spaceAfter As Single = 0, _
                    Optional spaceBefore As Single = 0, _
                    Optional isSmallCaps As Boolean = False, _
                    Optional fontColor As Long = 0)
    
    Dim rng As Range
    Set rng = doc.Content
    rng.Collapse Direction:=wdCollapseEnd
    rng.InsertAfter txt & vbCr
    
    ' Select the just-inserted paragraph
    Dim para As Paragraph
    Set para = doc.Paragraphs(doc.Paragraphs.Count)
    
    With para.Range.Font
        .Name = FONT_BODY
        .Size = fontSize
        .Bold = isBold
        .Italic = isItalic
        .SmallCaps = isSmallCaps
        If fontColor <> 0 Then .Color = fontColor
    End With
    
    With para.Format
        .Alignment = alignment
        .spaceAfter = spaceAfter
        .spaceBefore = spaceBefore
        .LineSpacingRule = wdLineSpaceSingle
        .FirstLineIndent = 0
    End With
End Sub

Private Sub AddBodyText(doc As Document, txt As String, _
                         Optional indent As Boolean = True, _
                         Optional spaceAfter As Single = 3)
    Dim rng As Range
    Set rng = doc.Content
    rng.Collapse Direction:=wdCollapseEnd
    rng.InsertAfter txt & vbCr
    
    Dim para As Paragraph
    Set para = doc.Paragraphs(doc.Paragraphs.Count)
    
    With para.Range.Font
        .Name = FONT_BODY
        .Size = FONT_SIZE_BODY
        .Bold = False
        .Italic = False
    End With
    
    With para.Format
        .Alignment = wdAlignParagraphJustify
        .spaceAfter = spaceAfter
        .spaceBefore = 0
        .LineSpacingRule = wdLineSpaceSingle
        If indent Then
            .FirstLineIndent = InchesToPoints(0.2)
        Else
            .FirstLineIndent = 0
        End If
    End With
End Sub

Private Sub AddHeading1(doc As Document, number As String, title As String)
    ' IEEE Level 1: Roman numeral, centered, small caps, bold
    Call AddText(doc, number & ". " & UCase(title), FONT_SIZE_HEADING1, _
                 True, False, wdAlignParagraphCenter, 6, 12, True)
End Sub

Private Sub AddHeading2(doc As Document, letter As String, title As String)
    ' IEEE Level 2: Letter, left-justified, italic
    Call AddText(doc, letter & ". " & title, FONT_SIZE_HEADING2, _
                 False, True, wdAlignParagraphLeft, 4, 8)
End Sub

Private Sub AddHeading3(doc As Document, title As String)
    ' IEEE Level 3: Indented, italic, run-in
    Call AddText(doc, title, FONT_SIZE_HEADING3, _
                 False, True, wdAlignParagraphLeft, 2, 4)
End Sub

' Helper to add a simple table
Private Sub AddSimpleTable(doc As Document, headers() As String, _
                            data() As String, numCols As Long, numRows As Long)
    Dim rng As Range
    Set rng = doc.Content
    rng.Collapse Direction:=wdCollapseEnd
    rng.InsertParagraphAfter
    Set rng = doc.Content
    rng.Collapse Direction:=wdCollapseEnd
    
    Dim tbl As Table
    Set tbl = doc.Tables.Add(rng, numRows + 1, numCols)
    
    tbl.Borders.Enable = True
    tbl.Borders.InsideLineStyle = wdLineStyleSingle
    tbl.Borders.OutsideLineStyle = wdLineStyleSingle
    
    ' Set table font
    tbl.Range.Font.Name = FONT_BODY
    tbl.Range.Font.Size = FONT_SIZE_CAPTION
    
    ' Headers
    Dim c As Long
    For c = 1 To numCols
        tbl.Cell(1, c).Range.Text = headers(c - 1)
        tbl.Cell(1, c).Range.Font.Bold = True
        tbl.Cell(1, c).Range.ParagraphFormat.Alignment = wdAlignParagraphCenter
    Next c
    
    ' Data
    Dim r As Long
    Dim idx As Long
    For r = 1 To numRows
        For c = 1 To numCols
            idx = (r - 1) * numCols + (c - 1)
            If idx <= UBound(data) Then
                tbl.Cell(r + 1, c).Range.Text = data(idx)
            End If
        Next c
    Next r
    
    ' Auto-fit
    tbl.AutoFitBehavior wdAutoFitContent
    
    ' Add spacing after table
    Set rng = doc.Content
    rng.Collapse Direction:=wdCollapseEnd
    rng.InsertParagraphAfter
End Sub

' ============================================================================
' SECTION: TITLE AND AUTHORS
' ============================================================================
Private Sub WriteTitle(doc As Document)
    ' Title
    Call AddText(doc, "Bhisma: An Open-Source Platform for Automated Security Testing and Red-Teaming of Large Language Model Applications", _
                 FONT_SIZE_TITLE, True, False, wdAlignParagraphCenter, 12, 0)
    
    ' Author
    Call AddText(doc, "Rohit Kandpal", FONT_SIZE_AUTHOR, False, False, _
                 wdAlignParagraphCenter, 2, 6)
    
    ' Affiliation
    Call AddText(doc, "Department of Computer Science and Engineering", _
                 FONT_SIZE_AFFILIATION, False, True, wdAlignParagraphCenter, 0, 0)
    Call AddText(doc, "Email: rohitkandpal@example.com", _
                 FONT_SIZE_AFFILIATION, False, True, wdAlignParagraphCenter, 12, 0)
End Sub

' ============================================================================
' SECTION: ABSTRACT
' ============================================================================
Private Sub WriteAbstract(doc As Document)
    ' Abstract heading
    Call AddText(doc, "Abstract", FONT_SIZE_BODY, True, True, _
                 wdAlignParagraphCenter, 6, 6)
    
    ' Abstract body - 9pt italic
    Dim absText As String
    absText = "The rapid integration of Large Language Models (LLMs) into production applications has introduced " & _
              "a novel class of security vulnerabilities that traditional security testing frameworks are ill-equipped " & _
              "to address. Prompt injection, jailbreaking, data exfiltration, and context boundary violations " & _
              "represent critical threats to LLM-powered systems, yet no standardized, open-source testing " & _
              "methodology exists for developers and security researchers. This paper presents Bhisma, an " & _
              "open-source web-based platform for automated security testing and red-teaming of LLM applications. " & _
              "Bhisma provides a curated library of 50 attack vectors organized across seven OWASP-aligned " & _
              "categories, including a novel Context Boundary Testing module that detects scope violations " & _
              "where models respond to queries outside their designated role. The platform features an automated " & _
              "scanning engine with a weighted risk scoring algorithm based on more than 80 detection patterns, " & _
              "support for multiple LLM providers including Groq, OpenAI, and Ollama, along with a defense testing " & _
              "sandbox comprising eight research-backed mitigation mechanisms. This paper details the system " & _
              "architecture, attack taxonomy, detection methodology, and context boundary analysis approach. " & _
              "Initial evaluation demonstrates that Bhisma identifies vulnerabilities across all major OWASP " & _
              "LLM Top 10 categories with configurable confidence thresholds, providing actionable security " & _
              "reports for developers deploying LLM-based applications."
    
    Call AddText(doc, absText, FONT_SIZE_ABSTRACT, False, True, _
                 wdAlignParagraphJustify, 6, 0)
    
    ' Keywords
    Dim kwText As String
    kwText = "Keywords -- LLM security, prompt injection, red-teaming, " & _
             "OWASP, automated testing, context boundary, AI safety, jailbreak detection"
    Call AddText(doc, kwText, FONT_SIZE_ABSTRACT, False, True, _
                 wdAlignParagraphJustify, 12, 0)
End Sub

' ============================================================================
' SECTION I: INTRODUCTION
' ============================================================================
Private Sub WriteIntroduction(doc As Document)
    Call AddHeading1(doc, "I", "Introduction")
    
    Call AddHeading2(doc, "A", "Background")
    
    Call AddBodyText(doc, _
        "Large Language Models have become foundational infrastructure in modern software systems. " & _
        "From customer-facing chatbots processing millions of daily interactions to code assistants " & _
        "embedded within integrated development environments and autonomous agents with database " & _
        "and API access, LLMs are increasingly entrusted with sensitive operations that directly " & _
        "affect organizational security postures [1]. This proliferation has outpaced the development " & _
        "of dedicated security testing tools, creating a significant and widening gap between the " & _
        "expanding attack surface of LLM applications and the available methods for systematic " & _
        "vulnerability assessment.")
    
    Call AddBodyText(doc, _
        "Unlike traditional software vulnerabilities such as buffer overflows, cross-site scripting, " & _
        "or SQL injection, LLM vulnerabilities exploit the natural language understanding capabilities " & _
        "of the model itself. An adversary can craft textual inputs that manipulate the model into " & _
        "overriding its safety instructions, leaking confidential system prompts, generating harmful " & _
        "content, or operating outside its designated operational scope. These attacks require no " & _
        "specialized technical infrastructure and can be executed through the same text input " & _
        "interfaces available to legitimate users [2].")
    
    Call AddHeading2(doc, "B", "Problem Statement")
    
    Call AddBodyText(doc, _
        "Current approaches to LLM security testing suffer from three critical limitations " & _
        "that impede the adoption of systematic vulnerability assessment in production environments.", False)
    
    Call AddBodyText(doc, _
        "First, existing tooling remains fragmented and inaccessible. Tools such as Garak [3] " & _
        "and Microsoft PyRIT [4] focus on specific attack categories and require significant " & _
        "Python expertise to deploy. No unified platform currently provides end-to-end security " & _
        "testing with both attack simulation and defence evaluation within a single interface.")
    
    Call AddBodyText(doc, _
        "Second, there exists no established methodology for context boundary testing. Most " & _
        "frameworks evaluate content safety and prompt injection resistance but overlook a " & _
        "fundamental vulnerability: whether the model remains within its designated operational " & _
        "scope. A medical chatbot that dispenses legal advice, or a coding assistant that offers " & _
        "investment recommendations, represents a context boundary violation that existing tools " & _
        "do not systematically detect or quantify.")
    
    Call AddBodyText(doc, _
        "Third, security assessments typically produce binary pass-fail results without " & _
        "standardized risk quantification. There is no widely adopted methodology for measuring " & _
        "the severity and confidence of detected vulnerabilities in a comparative, reproducible manner.")
    
    Call AddHeading2(doc, "C", "Contributions")
    
    Call AddBodyText(doc, _
        "This paper makes the following contributions to the field of LLM security:", False)
    
    Call AddBodyText(doc, _
        "1) Bhisma Platform: An open-source, web-based LLM security testing platform " & _
        "with 50 attack vectors across seven categories, supporting both automated and " & _
        "manual testing modes with persistent storage via SQLite.", False)
    
    Call AddBodyText(doc, _
        "2) Context Boundary Testing: A novel attack category and analysis algorithm " & _
        "that detects instances where LLMs respond to queries outside their designated scope.", False)
    
    Call AddBodyText(doc, _
        "3) Weighted Risk Scoring: A configurable risk quantification algorithm that combines " & _
        "severity weighting, confidence-based detection, and category-specific vulnerability " & _
        "indicators across more than 80 detection patterns.", False)
    
    Call AddBodyText(doc, _
        "4) Defence Sandbox: An integrated environment for evaluating eight research-backed " & _
        "defence mechanisms, including OWASP-recommended prompt hardening, input sanitization, " & _
        "output leak detection, and context length limiting.")
End Sub

' ============================================================================
' SECTION II: LITERATURE REVIEW
' ============================================================================
Private Sub WriteLiteratureReview(doc As Document)
    Call AddHeading1(doc, "II", "Literature Review")
    
    Call AddHeading2(doc, "A", "OWASP Top 10 for LLM Applications (2025)")
    
    Call AddBodyText(doc, _
        "The Open Worldwide Application Security Project published the definitive vulnerability " & _
        "classification for LLM applications [1], identifying ten critical risk categories. These " & _
        "include prompt injection (LLM01), sensitive information disclosure (LLM06), and excessive " & _
        "agency (LLM08). Bhisma aligns its attack taxonomy directly with this classification " & _
        "framework, ensuring enterprise-relevant testing coverage across all major vulnerability domains.")
    
    Call AddHeading2(doc, "B", "Adversarial Attack Research")
    
    Call AddBodyText(doc, _
        "Recent research has demonstrated increasingly sophisticated attack vectors against LLMs. " & _
        "Many-Shot Jailbreaking, published by Anthropic in 2024 [5], exploits in-context learning " & _
        "by embedding numerous examples of harmful behaviour within the prompt, gradually shifting " & _
        "the model's response distribution. Crescendo Attacks from Microsoft [6] employ multi-turn " & _
        "manipulation techniques that progressively escalate the conversational context toward " & _
        "restricted territory. Universal Adversarial Triggers discovered by Zou et al. [7] " & _
        "demonstrate token-level perturbations that transfer across models, enabling automated " & _
        "bypass of safety training. The ArtPrompt attack [8] exploits LLMs' inability to correctly " & _
        "perceive ASCII art representations, hiding malicious words that bypass text-based safety " & _
        "filters. The Skeleton Key attack from the Microsoft AI Red Team [9] convinces models " & _
        "to augment their safety guidelines by claiming authorized research purposes.")
    
    Call AddHeading2(doc, "C", "Existing Tools and Frameworks")
    
    ' Comparison table
    Dim headers(3) As String
    headers(0) = "Tool"
    headers(1) = "Type"
    headers(2) = "Limitations"
    headers(3) = "Year"
    
    Dim tData(15) As String
    tData(0) = "Garak [3]": tData(1) = "CLI probe framework": tData(2) = "Python expertise required; no UI; no defence testing": tData(3) = "2024"
    tData(4) = "PyRIT [4]": tData(5) = "Red-teaming toolkit": tData(6) = "Azure-focused; enterprise licensing; steep learning curve": tData(7) = "2024"
    tData(8) = "HackAPrompt [10]": tData(9) = "Research dataset": tData(10) = "Static dataset only; no automated testing pipeline": tData(11) = "2023"
    tData(12) = "MITRE ATLAS [11]": tData(13) = "Threat taxonomy": tData(14) = "Framework classification only; no testing capabilities": tData(15) = "2024"
    
    Call AddSimpleTable(doc, headers, tData, 4, 4)
    
    Call AddText(doc, "TABLE I. Comparison of existing LLM security tools", _
                 FONT_SIZE_CAPTION, False, False, wdAlignParagraphCenter, 8, 2)
    
    Call AddBodyText(doc, _
        "Bhisma differentiates itself from these tools by providing a unified web interface " & _
        "that combines attack simulation, defence testing, automated scanning, and risk " & _
        "reporting within a single platform accessible to developers without specialized " & _
        "security expertise.")
    
    Call AddHeading2(doc, "D", "Context Boundary as a Security Concern")
    
    Call AddBodyText(doc, _
        "While most LLM security research concentrates on explicit safety violations such " & _
        "as harmful content generation and data leakage, the problem of scope adherence " & _
        "remains under-explored in the literature. When an LLM application is deployed for a " & _
        "specific purpose, such as customer support for a retail company, it should not " & _
        "provide medical diagnoses, legal counsel, or political endorsements regardless of " & _
        "whether those responses are technically safe. Operating outside designated boundaries " & _
        "represents liability risk and may violate regulatory requirements in healthcare, " & _
        "financial services, and legal domains.")
End Sub

' ============================================================================
' SECTION III: SYSTEM ARCHITECTURE
' ============================================================================
Private Sub WriteSystemArchitecture(doc As Document)
    Call AddHeading1(doc, "III", "System Architecture")
    
    Call AddHeading2(doc, "A", "High-Level Design")
    
    Call AddBodyText(doc, _
        "Bhisma follows a client-server architecture organized into three primary components: " & _
        "a React-based frontend for user interaction, a Node.js backend providing RESTful APIs " & _
        "and attack orchestration, and an LLM integration layer supporting multiple providers. " & _
        "The system employs a separation of concerns pattern where the frontend manages user " & _
        "interface state through Zustand with localStorage persistence, while the backend handles " & _
        "attack execution, response analysis, and persistent storage through SQLite with Write-Ahead " & _
        "Logging enabled for improved concurrent read performance.")
    
    Call AddHeading2(doc, "B", "Technology Stack")
    
    Dim tsHeaders(2) As String
    tsHeaders(0) = "Component"
    tsHeaders(1) = "Technology"
    tsHeaders(2) = "Rationale"
    
    Dim tsData(17) As String
    tsData(0) = "Frontend": tsData(1) = "React 18 + Vite": tsData(2) = "Fast HMR, component architecture"
    tsData(3) = "Styling": tsData(4) = "TailwindCSS 4 + Glassmorphism": tsData(5) = "Accessible dark-mode interface"
    tsData(6) = "State": tsData(7) = "Zustand + Persist middleware": tsData(8) = "Lightweight localStorage-backed state"
    tsData(9) = "Backend": tsData(10) = "Express 5 + Node.js": tsData(11) = "Non-blocking I/O for concurrent API calls"
    tsData(12) = "Database": tsData(13) = "SQLite via better-sqlite3": tsData(14) = "WAL mode, zero-config persistence"
    tsData(15) = "Security": tsData(16) = "Helmet.js + express-rate-limit": tsData(17) = "OWASP-compliant HTTP headers"
    
    Call AddSimpleTable(doc, tsHeaders, tsData, 3, 6)
    Call AddText(doc, "TABLE II. Bhisma technology stack", _
                 FONT_SIZE_CAPTION, False, False, wdAlignParagraphCenter, 8, 2)
    
    Call AddHeading2(doc, "C", "Data Flow")
    
    Call AddBodyText(doc, _
        "The testing workflow proceeds through five stages. First, the user configures " & _
        "a target LLM by specifying provider credentials, model identifier, and optional " & _
        "system prompt context. Second, the user selects attack vectors manually from the " & _
        "categorized library or initiates an automated scan. Third, the backend iterates " & _
        "through each selected attack, transmitting the prompt to the target LLM via the " & _
        "appropriate provider SDK. Fourth, each LLM response is analysed by the multi-layered " & _
        "detection engine which applies refusal pattern matching, category-specific vulnerability " & _
        "indicators, compliance behaviour detection, and response length heuristics. Fifth, " & _
        "individual results are aggregated into a weighted risk score and returned as a structured " & _
        "test report with JSON and PDF export capabilities.")
    
    Call AddHeading2(doc, "D", "Security Middleware")
    
    Call AddBodyText(doc, _
        "The backend implements comprehensive security middleware following OWASP best practices. " & _
        "Helmet.js configures Content Security Policy headers restricting script sources to same-origin, " & _
        "style sources to the application domain and Google Fonts, and image sources to same-origin " & _
        "and data URIs. Express-rate-limit enforces two tiers of rate limiting: a general limit of " & _
        "100 requests per 15-minute window across API routes, and a stricter limit of five test " & _
        "executions per minute for resource-intensive scan endpoints. CORS is configured with an " & _
        "explicit origin whitelist, credential support, and a 24-hour preflight cache. Request body " & _
        "parsing enforces a 10-kilobyte payload limit to mitigate oversized request attacks. All " & _
        "requests are logged with timestamp and IP address for audit trail purposes.")
End Sub

' ============================================================================
' SECTION IV: METHODOLOGY
' ============================================================================
Private Sub WriteMethodology(doc As Document)
    Call AddHeading1(doc, "IV", "Methodology")
    
    Call AddHeading2(doc, "A", "Attack Taxonomy")
    
    Call AddBodyText(doc, _
        "Bhisma organizes 50 attack vectors across seven categories aligned with the OWASP " & _
        "LLM Top 10 (2025) classification. Each attack vector is characterized by a unique " & _
        "identifier, descriptive name, category assignment, severity classification (critical, " & _
        "high, medium, or low), research source attribution, and the attack prompt itself. " & _
        "Attacks flagged for automated scanning are selected to provide maximum category " & _
        "coverage with minimal execution time.")
    
    ' Attack taxonomy table
    Dim atHeaders(3) As String
    atHeaders(0) = "Category"
    atHeaders(1) = "Count"
    atHeaders(2) = "OWASP Mapping"
    atHeaders(3) = "Subcategories"
    
    Dim atData(27) As String
    atData(0) = "Prompt Injection": atData(1) = "13": atData(2) = "LLM01": atData(3) = "Direct, indirect, obfuscation, encoding, stealth"
    atData(4) = "Jailbreak": atData(5) = "14": atData(6) = "LLM01": atData(7) = "Roleplay, rhetoric, context manipulation, multi-turn"
    atData(8) = "Data Extraction": atData(9) = "7": atData(10) = "LLM06, LLM07": atData(11) = "System prompt leakage, error exploitation"
    atData(12) = "Harmful Content": atData(13) = "4": atData(14) = "LLM02, LLM09": atData(15) = "Code generation, social engineering"
    atData(16) = "Context Override": atData(17) = "5": atData(18) = "LLM08": atData(19) = "Impersonation, tool manipulation, poisoning"
    atData(20) = "Context Boundary": atData(21) = "8": atData(22) = "LLM08": atData(23) = "Scope violation across 8 domains"
    atData(24) = "Multimodal": atData(25) = "1": atData(26) = "Cross-category": atData(27) = "Image alt-text injection (simulated)"
    
    Call AddSimpleTable(doc, atHeaders, atData, 4, 7)
    Call AddText(doc, "TABLE III. Bhisma attack taxonomy aligned with OWASP LLM Top 10", _
                 FONT_SIZE_CAPTION, False, False, wdAlignParagraphCenter, 8, 2)
    
    Call AddHeading2(doc, "B", "Detection Algorithm")
    
    Call AddBodyText(doc, _
        "The detection engine employs a multi-layered analysis approach operating on the raw " & _
        "textual response returned by the target LLM. Each layer operates independently and " & _
        "contributes to the final vulnerability determination and confidence score.")
    
    Call AddHeading3(doc, "Layer 1: Refusal Pattern Matching")
    Call AddBodyText(doc, _
        "The first layer scans responses against a corpus of 25 refusal patterns encompassing " & _
        "direct refusals, policy statements, safety responses, contextual apologies, AI identity " & _
        "declarations, and explicit blocks. When two or more refusal patterns are detected, the " & _
        "response is classified as safe with 95 percent confidence. A single refusal pattern " & _
        "yields an 80 percent confidence safe classification, unless contradicted by subsequent layers.")
    
    Call AddHeading3(doc, "Layer 2: Category-Specific Vulnerability Indicators")
    Call AddBodyText(doc, _
        "Each of the seven attack categories maintains a dedicated set of vulnerability indicator " & _
        "patterns. For prompt injection, these include phrases such as 'my instructions are' and " & _
        "'ignoring previous.' For jailbreak attacks, indicators include 'as DAN,' 'without " & _
        "restrictions,' and roleplay acknowledgements. Data extraction indicators detect system " & _
        "prompt leakage phrases. Harmful content indicators identify code patterns including " & _
        "dangerous imports and exploit function definitions. The base confidence for indicator " & _
        "matches starts at 55 percent with a 12-point bonus per additional match, capped at a " & _
        "maximum of 98 percent confidence.")
    
    Call AddHeading3(doc, "Layer 3: Compliance Behaviour Detection")
    Call AddBodyText(doc, _
        "The third layer detects patterns indicating the model is actively complying with the " & _
        "attack request. Compliance indicators include phrases such as 'sure, I will help,' " & _
        "'here you go,' 'as requested,' and step-by-step formatting cues. When compliance is " & _
        "detected without accompanying refusal in a response exceeding 150 characters, the " & _
        "engine evaluates additional signals including response length, presence of code blocks, " & _
        "and step-by-step structure to determine vulnerability at 65 percent confidence.")
    
    Call AddHeading3(doc, "Layer 4: Response Length Heuristics")
    Call AddBodyText(doc, _
        "The final layer applies length-based heuristics to responses that produced no indicator " & _
        "matches. Responses exceeding 500 characters without any refusal pattern are flagged as " & _
        "potentially vulnerable with 50 percent confidence and a recommendation for manual review. " & _
        "Responses between 200 and 500 characters without refusal receive a 40 percent confidence " & _
        "vulnerability flag. Short responses without clear indicators are classified as neutral " & _
        "with 55 percent confidence.")
    
    Call AddHeading2(doc, "C", "Risk Scoring Algorithm")
    
    Call AddBodyText(doc, _
        "The composite risk score is calculated using a weighted formula that accounts for both " & _
        "severity and detection confidence. For each test result, the severity weight is drawn " & _
        "from a four-tier scale: critical at 25 points, high at 15 points, medium at 8 points, " & _
        "and low at 3 points. The risk score is computed as the ratio of the sum of weighted " & _
        "confidence values for vulnerable results to the maximum possible weighted score, " & _
        "expressed as a percentage. Risk levels are classified into five tiers: critical (70-100), " & _
        "high (50-69), medium (30-49), low (10-29), and minimal (0-9).")
    
    Call AddHeading2(doc, "D", "Context Boundary Analysis")
    
    Call AddBodyText(doc, _
        "The context boundary analysis module evaluates whether an LLM maintains fidelity to its " & _
        "designated operational scope. This capability addresses a security concern particularly " & _
        "relevant to domain-specific deployments in regulated industries.")
    
    Call AddBodyText(doc, _
        "The algorithm operates in three stages. First, an out-of-scope prompt is transmitted " & _
        "to the target model, optionally accompanied by the model's system prompt to test under " & _
        "realistic deployment conditions. Second, the response is analysed for boundary refusal " & _
        "patterns including phrases such as 'outside my scope,' 'I specialize in,' and 'please " & _
        "consult a professional.' Third, if no boundary refusal is detected, the response is " & _
        "examined for scope violation indicators specific to each off-topic domain. A refusal " & _
        "coupled with a response under 300 characters yields a safe classification at 90 percent " & _
        "confidence. Indicator matches yield a vulnerable classification at 85 percent confidence. " & _
        "Long responses exceeding 300 characters without refusal score 70 percent confidence.")
    
    Call AddBodyText(doc, _
        "The module incorporates eight context boundary attacks spanning cooking, medical diagnosis, " & _
        "legal counsel, financial investment, relationship counselling, creative fiction, religious " & _
        "opinion, and political opinion domains. These represent the most common scope violation " & _
        "scenarios encountered in production LLM deployments.")
    
    Call AddHeading2(doc, "E", "Automated Scan")
    
    Call AddBodyText(doc, _
        "The automated scan feature runs 15 curated attacks selected to provide maximum coverage " & _
        "with minimal execution time. The curated suite includes two direct prompt injection attacks, " & _
        "one indirect prompt injection, one DAN jailbreak, one data extraction attack, one harmful " & _
        "content request, one context override attack, and all eight context boundary attacks. This " & _
        "selection ensures comprehensive coverage across all seven attack categories in a single " & _
        "automated execution requiring only a model configuration and optional system prompt.")
End Sub

' ============================================================================
' SECTION V: IMPLEMENTATION
' ============================================================================
Private Sub WriteImplementation(doc As Document)
    Call AddHeading1(doc, "V", "Implementation Details")
    
    Call AddHeading2(doc, "A", "Frontend Architecture")
    
    Call AddBodyText(doc, _
        "The frontend is built with React 18 and Vite, featuring a glassmorphism-inspired " & _
        "dark-mode interface using TailwindCSS 4. The application comprises seven primary pages. " & _
        "The Dashboard provides an onboarding flow with quick-action links and aggregated test " & _
        "statistics. The Models page enables multi-provider LLM configuration with connection " & _
        "testing across Groq, OpenAI, Ollama, and custom OpenAI-compatible endpoints. The " & _
        "Attacks page presents a category-filtered browser with severity indicators and MITRE " & _
        "ATLAS mapping for select attacks. The Test page provides dual-mode testing supporting " & _
        "both manual attack selection and automated scanning with system prompt input. The Results " & _
        "page displays detailed vulnerability reports with JSON export, PDF generation via browser " & _
        "print, and clipboard copy functionality. The Defences page offers a terminal-style sandbox " & _
        "for evaluating defence mechanisms. The Compare page enables side-by-side model comparison " & _
        "with statistical validity checks.")
    
    Call AddBodyText(doc, _
        "Application state is managed through Zustand with the persist middleware backed by " & _
        "localStorage. Persisted state includes configured models, selected attacks, test results " & _
        "capped at the 50 most recent entries, and navigation state. Runtime state such as test " & _
        "progress indicators, toast notifications, and loading flags are excluded from persistence " & _
        "to prevent stale UI state. The store implements version numbering to support future " & _
        "migration paths.")
    
    Call AddHeading2(doc, "B", "Backend Architecture")
    
    Call AddBodyText(doc, _
        "The Express 5 backend provides five RESTful API route groups. The models endpoint " & _
        "supports CRUD operations and connection testing through actual LLM API calls. The " & _
        "attacks endpoint serves the built-in library of 50 attack vectors alongside user-created " & _
        "custom attacks stored in SQLite, with category filtering capability. The tests endpoint " & _
        "handles both manual test execution and automated scanning. The defences endpoint provides " & _
        "defence mechanism retrieval, prompt transformation with defence application, and output " & _
        "leak scanning. The compare endpoint performs statistical analysis of multiple test results " & _
        "with category-level breakdown and automated recommendations.")
    
    Call AddBodyText(doc, _
        "Persistent storage uses SQLite via the better-sqlite3 library with Write-Ahead Logging " & _
        "enabled for improved concurrent read performance. The schema comprises five tables: " & _
        "models, test_results, custom_attacks, comparisons, and active_defenses. All database " & _
        "operations use prepared statements for both performance optimization and SQL injection " & _
        "prevention. Foreign key enforcement is enabled at the database level.")
    
    Call AddHeading2(doc, "C", "Defence Sandbox")
    
    Call AddBodyText(doc, _
        "Eight research-backed defence mechanisms are implemented spanning five categories. " & _
        "System Prompt Hardening following OWASP guidelines prepends comprehensive security " & _
        "rules covering identity anchoring, confidentiality, safety, override immunity, and " & _
        "external content handling. Input Sanitization employs ten regular expression patterns " & _
        "targeting common attack signatures including instruction override attempts, jailbreak " & _
        "patterns, system prompt extraction, privilege escalation, token manipulation, and " & _
        "encoding bypass. Output Leak Detection scans responses against 18 sensitive information " & _
        "indicators including system prompt leakage, credential exposure, and dangerous code " & _
        "patterns. Role Anchoring reinforces the model's identity to resist persona switching " & _
        "attacks. Delimiter Injection implements the Spotlighting technique from Microsoft Azure " & _
        "AI research, using explicit boundary markers to separate trusted instructions from " & _
        "untrusted user input. Instructional Defence explicitly instructs the model to treat " & _
        "subsequent content as data rather than commands. Jailbreak Detection employs pattern-based " & _
        "pre-processing to identify and flag roleplay, hypothetical framing, educational framing, " & _
        "and social engineering attempts. Context Length Limiting caps input at 2000 tokens and " & _
        "three examples to mitigate many-shot jailbreaking.")
    
    Call AddHeading2(doc, "D", "Multi-Provider LLM Integration")
    
    Call AddBodyText(doc, _
        "Bhisma supports four LLM provider integrations through a unified message format. Groq " & _
        "integration uses the official Groq SDK with the llama-3.3-70b-versatile model as default. " & _
        "OpenAI integration uses the official OpenAI SDK with GPT-3.5-turbo as default. Ollama " & _
        "integration connects to local or self-hosted instances via the OpenAI-compatible API " & _
        "endpoint at localhost port 11434. Custom provider support enables connection to any " & _
        "OpenAI-compatible API endpoint with configurable base URL and optional authentication. " & _
        "All providers share identical message construction logic, building an array with an " & _
        "optional system message and the attack prompt as user message, with responses capped " & _
        "at 500 tokens and temperature set to 0.7 for reproducibility.")
End Sub

' ============================================================================
' SECTION VI: RESULTS AND ANALYSIS
' ============================================================================
Private Sub WriteResultsAndAnalysis(doc As Document)
    Call AddHeading1(doc, "VI", "Results and Analysis")
    
    Call AddHeading2(doc, "A", "Attack Coverage")
    
    Call AddBodyText(doc, _
        "Bhisma's attack library provides coverage across five of the ten OWASP LLM Top 10 " & _
        "(2025) categories, with the remaining categories addressed through related attack " & _
        "vectors and the extensible custom attack system.")
    
    Dim acHeaders(2) As String
    acHeaders(0) = "OWASP Category"
    acHeaders(1) = "Bhisma Coverage"
    acHeaders(2) = "Attack Count"
    
    Dim acData(14) As String
    acData(0) = "LLM01: Prompt Injection": acData(1) = "Direct + Indirect + Obfuscation": acData(2) = "13"
    acData(3) = "LLM02: Insecure Output": acData(4) = "Harmful Content Generation": acData(5) = "4"
    acData(6) = "LLM06: Sensitive Info Disclosure": acData(7) = "Data Extraction Suite": acData(8) = "7"
    acData(9) = "LLM08: Excessive Agency": acData(10) = "Context Override + Boundary": acData(11) = "13"
    acData(12) = "LLM09: Misinformation": acData(13) = "Creative Extraction": acData(14) = "3"
    
    Call AddSimpleTable(doc, acHeaders, acData, 3, 5)
    Call AddText(doc, "TABLE IV. OWASP LLM Top 10 coverage analysis", _
                 FONT_SIZE_CAPTION, False, False, wdAlignParagraphCenter, 8, 2)
    
    Call AddHeading2(doc, "B", "Detection Engine Characteristics")
    
    Call AddBodyText(doc, _
        "The multi-layered detection engine provides graduated confidence levels across different " & _
        "detection scenarios. Clear model refusals involving two or more matched patterns achieve " & _
        "the highest confidence range of 80 to 95 percent. Category-specific vulnerability indicator " & _
        "matches yield confidence between 55 and 98 percent, scaling with the number of indicators " & _
        "detected. Compliance behaviour detection without refusal operates at 55 to 65 percent " & _
        "confidence. Length-based heuristics provide the lowest confidence signals at 40 to 50 percent, " & _
        "serving as a fallback when pattern-based methods produce no matches. Context boundary " & _
        "analysis operates across a 55 to 90 percent confidence range depending on the specificity " & _
        "of detected scope violation indicators.")
    
    Call AddHeading2(doc, "C", "Automated Scan Efficiency")
    
    Call AddBodyText(doc, _
        "The automated scan facility reduces the barrier to entry for LLM security testing by " & _
        "eliminating the manual attack selection process. Setup time is reduced from approximately " & _
        "five minutes of browsing and selecting individual attacks to approximately 30 seconds of " & _
        "configuring the target model. Category coverage is guaranteed across all seven attack " & _
        "categories regardless of operator expertise. Context boundary testing, which is frequently " & _
        "overlooked in manual assessments, is always included. System prompt support is built into " & _
        "the automated workflow, enabling realistic testing under deployment-equivalent conditions.")
    
    Call AddHeading2(doc, "D", "Model Comparison Analytics")
    
    Call AddBodyText(doc, _
        "The comparison module enables quantitative security assessment across multiple LLM models. " & _
        "The system performs per-category vulnerability breakdown, computing pass and fail rates for " & _
        "each attack category across all compared models. Models are ranked by composite risk score " & _
        "with the most and least secure models identified. Automated recommendations are generated " & _
        "when risk scores exceed defined thresholds, suggesting defence mechanism deployment for " & _
        "high-risk models and acknowledging strong security posture for low-risk models.")
End Sub

' ============================================================================
' SECTION VII: DISCUSSION
' ============================================================================
Private Sub WriteDiscussion(doc As Document)
    Call AddHeading1(doc, "VII", "Discussion")
    
    Call AddHeading2(doc, "A", "Limitations")
    
    Call AddBodyText(doc, _
        "Several limitations of the current implementation warrant acknowledgement. First, " & _
        "the detection engine relies on heuristic pattern matching rather than semantic understanding " & _
        "of response content. Adversaries employing novel phrasing or indirect compliance may evade " & _
        "pattern-based detection. Incorporating LLM-based response analysis in a secondary evaluation " & _
        "pass would improve detection accuracy at the cost of additional API consumption.")
    
    Call AddBodyText(doc, _
        "Second, testing requires valid API credentials for commercial LLM providers. Rate limits " & _
        "and monetary costs vary by provider and model, which may constrain the scope of testing " & _
        "for large attack libraries. The inclusion of Ollama support partially mitigates this " & _
        "limitation by enabling local model testing without API costs.")
    
    Call AddBodyText(doc, _
        "Third, the current attack suite operates primarily in single-turn mode. While multi-turn " & _
        "attacks such as the Crescendo pattern are represented through concatenated turn simulations, " & _
        "true multi-turn sequential context management with maintained conversation state is not " & _
        "yet supported. This represents a significant area for future development.")
    
    Call AddBodyText(doc, _
        "Fourth, the platform lacks formal benchmark evaluation against established vulnerability " & _
        "datasets. While the detection patterns are derived from published security research, " & _
        "systematic validation using labelled datasets would strengthen the empirical foundation " & _
        "of the detection methodology.")
    
    Call AddHeading2(doc, "B", "Ethical Considerations")
    
    Call AddBodyText(doc, _
        "Bhisma is designed exclusively for defensive security testing purposes. The attack " & _
        "library is curated to evaluate model robustness without providing actual harmful " & _
        "capabilities. All incorporated attack vectors are well-documented in existing security " & _
        "research literature, OWASP publications, and conference proceedings. The platform " & _
        "requires user-provided API credentials ensuring accountability and auditability. Clear " & _
        "warnings regarding responsible usage are integrated into the platform interface.")
    
    Call AddHeading2(doc, "C", "Comparison with Existing Work")
    
    Call AddBodyText(doc, _
        "Compared to Garak, Bhisma provides a graphical web interface eliminating the need for " & _
        "command-line proficiency, integrates defence testing alongside attack simulation, and " & _
        "introduces context boundary testing as a first-class concern. Compared to PyRIT, " & _
        "Bhisma offers provider-agnostic testing without Azure dependency, open-source licensing " & _
        "without enterprise constraints, and a lower barrier to entry for non-specialist users. " & _
        "The risk scoring methodology provides quantitative comparability absent from binary " & _
        "pass-fail frameworks used by existing tools.")
End Sub

' ============================================================================
' SECTION VIII: CONCLUSION
' ============================================================================
Private Sub WriteConclusion(doc As Document)
    Call AddHeading1(doc, "VIII", "Conclusion and Future Work")
    
    Call AddHeading2(doc, "A", "Conclusion")
    
    Call AddBodyText(doc, _
        "This paper presented Bhisma, an open-source platform for automated security testing " & _
        "and red-teaming of Large Language Model applications. By combining 50 OWASP-aligned " & _
        "attack vectors spanning seven categories, a novel context boundary testing module, a " & _
        "weighted risk scoring algorithm with multi-layered detection across more than 80 patterns, " & _
        "and a defence testing sandbox with eight research-backed mechanisms, Bhisma provides a " & _
        "comprehensive and accessible security assessment toolkit for LLM application developers. " & _
        "The platform's automated scan feature enables rapid security evaluation without specialized " & _
        "expertise, while its persistent storage, export capabilities, and model comparison " & _
        "analytics support reproducible vulnerability documentation and longitudinal security tracking.")
    
    Call AddHeading2(doc, "B", "Future Work")
    
    Call AddBodyText(doc, _
        "Several directions for future development have been identified. First, implementation " & _
        "of genuine multi-turn attack support with maintained conversation state would enable " & _
        "Crescendo-style sequential attacks. Second, replacing pattern-based detection with " & _
        "LLM-based semantic response analysis would improve accuracy against novel attack " & _
        "formulations. Third, integration with continuous integration and continuous deployment " & _
        "pipelines through command-line tools and GitHub Actions would enable automated security " & _
        "regression testing. Fourth, expansion to multimodal testing for image, audio, and video " & _
        "inputs would address the growing deployment of multimodal LLMs. Fifth, systematic " & _
        "benchmark evaluation using established vulnerability datasets would provide formal " & _
        "validation of the detection methodology.")
End Sub

' ============================================================================
' SECTION: REFERENCES
' ============================================================================
Private Sub WriteReferences(doc As Document)
    Call AddHeading1(doc, "", "References")
    
    Dim refs(10) As String
    refs(0) = "[1] OWASP Foundation, " & Chr(34) & "OWASP Top 10 for Large Language Model Applications," & Chr(34) & " OWASP GenAI Security Project, 2025."
    refs(1) = "[2] S. Willison, " & Chr(34) & "Prompt Injection: What" & Chr(39) & "s the worst that can happen?" & Chr(34) & " 2023. [Online]. Available: https://simonwillison.net/"
    refs(2) = "[3] L. Derczynski et al., " & Chr(34) & "Garak: A Framework for Security Probing Large Language Models," & Chr(34) & " in Proc. EMNLP 2024, 2024."
    refs(3) = "[4] Microsoft, " & Chr(34) & "PyRIT: Python Risk Identification Toolkit for LLMs," & Chr(34) & " Microsoft Security Research, 2024."
    refs(4) = "[5] Anthropic, " & Chr(34) & "Many-Shot Jailbreaking," & Chr(34) & " Anthropic Research, 2024."
    refs(5) = "[6] Microsoft Security, " & Chr(34) & "Crescendo: Multi-Turn Jailbreak Attacks on LLMs," & Chr(34) & " Microsoft Threat Intelligence, 2024."
    refs(6) = "[7] A. Zou, Z. Wang, J. Z. Kolter, and M. Fredrikson, " & Chr(34) & "Universal and Transferable Adversarial Attacks on Aligned Language Models," & Chr(34) & " arXiv:2307.15043, 2023."
    refs(7) = "[8] J. Jiang, Z. Ren, et al., " & Chr(34) & "ArtPrompt: ASCII Art-based Jailbreak Attacks against Aligned LLMs," & Chr(34) & " arXiv:2402.11753, 2024."
    refs(8) = "[9] Microsoft AI Red Team, " & Chr(34) & "Skeleton Key: A Novel Jailbreak Technique for AI Models," & Chr(34) & " Microsoft Security Blog, 2024."
    refs(9) = "[10] S. Schulhoff et al., " & Chr(34) & "HackAPrompt: Exposing LLM Vulnerabilities Through Adversarial Prompt Engineering," & Chr(34) & " in Proc. EMNLP 2023."
    refs(10) = "[11] MITRE Corporation, " & Chr(34) & "ATLAS: Adversarial Threat Landscape for AI Systems," & Chr(34) & " 2024. [Online]. Available: https://atlas.mitre.org/"
    
    Dim i As Long
    For i = 0 To 10
        Call AddText(doc, refs(i), FONT_SIZE_REFERENCE, False, False, _
                     wdAlignParagraphJustify, 2, 0)
    Next i
End Sub

' ============================================================================
' FINAL: Apply Double Column Layout
' ============================================================================
Private Sub ApplyDoubleColumn(doc As Document)
    ' Apply two-column layout to everything AFTER the title/author block
    ' Find the end of the author section (after "Email:" line)
    Dim startRange As Range
    Set startRange = doc.Content
    
    Dim found As Boolean
    found = False
    
    Dim p As Paragraph
    Dim paraCount As Long
    paraCount = 0
    
    For Each p In doc.Paragraphs
        paraCount = paraCount + 1
        If InStr(LCase(p.Range.Text), "email:") > 0 Then
            found = True
            Exit For
        End If
        ' Fallback: after 4th paragraph (title + author + affiliation + email)
        If paraCount >= 5 Then
            found = True
            Exit For
        End If
    Next p
    
    If found Then
        ' Insert section break after author block
        Dim rng As Range
        Set rng = p.Range
        rng.Collapse Direction:=wdCollapseEnd
        rng.InsertBreak Type:=wdSectionBreakContinuous
        
        ' Set section 2+ to two columns
        Dim sec As Section
        If doc.Sections.Count >= 2 Then
            Set sec = doc.Sections(2)
            With sec.PageSetup.TextColumns
                .SetCount 2
                .Spacing = InchesToPoints(COLUMN_SPACING)
                .EvenlySpaced = True
                .LineBetween = False
            End With
        End If
        
        ' Keep section 1 (title) as single column
        With doc.Sections(1).PageSetup.TextColumns
            .SetCount 1
        End With
    End If
End Sub
