ML.addChapter({
    id: 2,
    title: 'Machine Learning Pipeline',
    short: 'ML Pipeline',
    lecture: 'Lecture 2',
    color: '#65a30d',
    blurb: 'CRISP-DM vs the technical pipeline, data formats, pandas inspection, cleaning, missing values, encoding, scaling, groupby and charts.',
    outcomes: [
        'Explain CRISP-DM and the ML pipeline',
        'Identify common ML data formats and sources',
        'Perform basic pandas data inspection; clean missing values and duplicates',
        'Apply categorical encoding and feature scaling; implement basic transformations',
        'Summarise data using grouping functions and select appropriate visualisations'
    ],
    topics: [
        {
            id: 'pipeline', title: 'CRISP-DM vs the ML pipeline',
            html: String.raw`
<p class="lead">Scenario: predict equipment failure from factory sensor data. Do we start by choosing the algorithm? <strong>No.</strong> The algorithm is only a small fraction of the total workflow.</p>

<h3>CRISP-DM phases</h3>
<div class="flow arrows"><span>1 Business Understanding</span><span>2 Data Understanding</span><span>3 Data Preparation<small>heaviest stage</small></span><span>4 Modelling</span><span>5 Evaluation</span><span>6 Deployment</span></div>
<div class="two">
<div class="card"><h5>1. Business understanding</h5><p>What problem? What outcome? How is success measured?<br><em>Business:</em> "Reduce unexpected downtime." → <em>ML:</em> "Predict equipment failure within 24h."</p></div>
<div class="card"><h5>2. Data understanding</h5><p>What data is available? Is it relevant and complete? What quality problems exist? <em>Action:</em> collect sensor logs, identify missing values, spot early patterns.</p></div>
</div>

<h3>The standard ML pipeline</h3>
<div class="flow arrows"><span>Raw Data</span><span>Preprocessing &amp; Wrangling</span><span>Feature Engineering</span><span>Model Training</span><span>Evaluation &amp; Tuning</span><span>Deployment &amp; Monitoring</span></div>
<p>The pipeline is the technical, solution-based workflow. It assumes CRISP-DM aspects such as business and data understanding, technique selection, and risk/assumption/constraint assessment are already covered.</p>

<div class="vs">
<div><h5>CRISP-DM: the project framework</h5><ul><li>Broad business focus</li><li>Includes strategy and objectives</li><li>Guides the whole team (managers, engineers, analysts)</li></ul></div>
<div><h5>ML pipeline: the technical workflow</h5><ul><li>Strictly technical focus</li><li>Code, scripts and algorithms</li><li>Automatically executes the "Data Prep" and "Modelling" phases</li></ul></div>
</div>

<h3>Crucial rule: preprocessing consistency</h3>
<div class="vs">
<div><h5>During training</h5><p>Training data → preprocessing → model training.</p><ul><li><strong>Learn</strong> scaling parameters (e.g. min, max)</li><li><strong>Learn</strong> categorical mappings</li></ul></div>
<div><h5>During deployment (inference)</h5><p>New data → <strong>same</strong> preprocessing → prediction.</p><ul><li>Apply the <strong>exact same parameters</strong> learned in training</li><li><strong>Never</strong> recalculate parameters on new individual records</li></ul></div>
</div>
<div class="callout trap"><span class="ttl">Data leakage</span>Using information from the test set (e.g. recalculating min/max on test data) to transform data <strong>falsely inflates accuracy</strong>. Fit on train and only transform test.</div>

<p><strong>Unsupervised pipeline</strong>: the same data-preparation phase, but there are no labels. You train an unsupervised algorithm on the training features only.</p>

<h3>Python ecosystem</h3>
<p>Python was created by Guido van Rossum at CWI (Netherlands) and first released in 1991. <strong>Strengths</strong>: easy to learn, supports multiple paradigms, extensible, and has an active open-source community. <strong>Limitation</strong>: slower execution than C/C++, because code runs through the Python virtual machine layer instead of being compiled directly.</p>

<details class="check"><summary>Check yourself: your scaler learned min=0, max=200 on training data. A new record arrives with value 250. What do you do?</summary><div><p>Apply the <em>training</em> parameters: (250−0)/(200−0) = 1.25. Don't refit the scaler on the new record. Values outside [0,1] are fine.</p></div></details>
`
        },
        {
            id: 'sources', title: 'Data formats, sources & types',
            html: String.raw`
<div class="tbl-wrap"><table class="tbl">
<tr><th>Format</th><th>Structure</th><th>Typical use</th><th>Notes</th></tr>
<tr><td><strong>CSV</strong></td><td>Tabular (rows &amp; columns), comma-delimited</td><td>Standard ML datasets, Excel exports</td><td>One of the oldest and most widely available formats. Naturally tabular, so best for pandas.</td></tr>
<tr><td><strong>JSON</strong></td><td>Nested key–value pairs</td><td>Web APIs, NoSQL DBs</td><td>Lightweight alternative to XML. Maps to Python <code>dict</code>. Hierarchical, so it needs flattening for ML.</td></tr>
<tr><td><strong>XML</strong></td><td>Tag-based tree</td><td>Legacy enterprise systems</td><td>Outdated but still used. Verbose, and needs specific parsers.</td></tr>
<tr><td><strong>SQL</strong></td><td>Relational tables</td><td>Enterprise data warehouses</td><td>Accessed via SQL queries or an ORM.</td></tr>
</table></div>

<h3>XML components</h3>
<ol><li><strong>Tag</strong>: markup in angle brackets &lt; &gt;</li><li><strong>Content</strong>: data not inside tag syntax</li><li><strong>Element</strong>: logical construct with start/end tag (with or without attributes) or an empty tag</li><li><strong>Attribute</strong>: key–value pairs inside a start or empty tag</li></ol>

<h3>HTML &amp; web scraping</h3>
<p>HTML is a markup language like XML, used by browsers to render pages. Its components are elements and tags such as <code>&lt;html&gt;</code> (whole document) and <code>&lt;body&gt;</code> (main rendered content).</p>
<div class="flow arrows"><span>1. Crawl<small>bot queries server with URLs, fetches pages</small></span><span>2. Scrape<small>extract info using regex, XPath, specific tags</small></span></div>

<h3>SQL in Python: two ways</h3>
<div class="vs">
<div><h5>Direct SQL queries</h5><p><code>sqlalchemy</code>, <code>pyodbc</code> (MS SQL Server, MySQL, Oracle…), and <code>sqlite3</code> for lightweight SQLite. The most common approach.</p></div>
<div><h5>ORM (Object Relational Mapper)</h5><p>Relational data is mapped to objects and classes. <code>sqlalchemy</code> provides a high-level ORM interface.</p></div>
</div>

<h3>Data types matter</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Type</th><th>Example</th><th>Required preprocessing</th></tr>
<tr><td>Numeric</td><td>Age 25, Price 99.99</td><td>Scaling, normalisation</td></tr>
<tr><td>Categorical</td><td>Colour Red, Size Medium</td><td>Label encoding, one-hot encoding</td></tr>
<tr><td>Text</td><td>"Great product, highly recommend!"</td><td>Tokenisation, stopword removal, TF-IDF</td></tr>
<tr><td>Datetime</td><td>2026-09-22 14:30:00</td><td>Extract day, month, duration</td></tr>
</table></div>

<details class="check"><summary>Check yourself: a web API returns nested customer orders. Which format, and what extra step before ML?</summary><div><p>JSON. It's hierarchical, so you must <strong>flatten</strong> it into a table, e.g. with <code>pd.json_normalize</code>.</p></div></details>
`
        },
        {
            id: 'inspect', title: 'Inspecting & wrangling with pandas',
            html: String.raw`
<p class="lead"><strong>Data wrangling (munging)</strong> means cleaning, transforming and mapping data from one form to another for analytics, reporting, visualisation and ML. <em>Garbage in, garbage out</em>: algorithms cannot fix bad data.</p>

<h3>Working dataset: transactions</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Date</th><th>Product ID</th><th>Quantity Purchased</th><th>Price</th><th>User Type</th><th>Serial No</th></tr>
<tr><td>2023-01-15</td><td>P-101</td><td>2</td><td>150.00</td><td>New</td><td>SN993</td></tr>
<tr><td>2023-01-15</td><td>P-105</td><td class="hl">NaN</td><td>85.50</td><td>Returning</td><td>SN211</td></tr>
<tr><td class="hl">16/01/2023</td><td>P-101</td><td>1</td><td>150.00</td><td>Premium</td><td class="hl">SN993</td></tr>
</table></div>
<p>Issues: <strong>inconsistent dates</strong>, <strong>missing values</strong> (NaN), <strong>spaces in column names</strong>, and a repeated serial number.</p>

<h3>First step: inspect</h3>
<div class="vs">
<div><h5><code>df.info()</code></h5><ul><li>Number of rows and columns</li><li>Column dtypes (int, float, object)</li><li>Non-null counts, which reveal missing data</li><li>Memory usage</li></ul></div>
<div><h5><code>df.describe()</code></h5><ul><li>Statistical summary of numeric columns</li><li>Mean, std, min, max, quartiles</li><li>Helps spot extreme outliers instantly</li></ul></div>
</div>
<div class="callout key"><span class="ttl">Data quality checklist</span>Missing values · Duplicate records · Wrong data types · Extreme outliers. Any of these can silently degrade model accuracy.</div>

<h3>Cleaning structure</h3>
<pre><code># 1. Rename columns (remove spaces)
df.rename(columns={"Quantity Purchased": "quantity"}, inplace=True)

# 2. Filter rows by condition
high_value = df[df["price"] > 100]

# 3. Select columns: by name / position / type
df["price"]            # name
df.iloc[:, 3]          # position (0-indexed)
df.select_dtypes("number")   # by data type (include/exclude)

# Row subsets
df.iloc[[0, 2, 5]]     # by integer location
df.drop([1, 3])        # drop specific row indices
df.head(3); df.tail(3) # offset from top / bottom</code></pre>

<h3>Typecasting</h3>
<p>Data that looks right to humans can have the wrong computational type.</p>
<pre><code>df["date"]  = pd.to_datetime(df["date"])   # "2023-01-15" string -> datetime64
df["price"] = pd.to_numeric(df["price"])   # after stripping currency symbols</code></pre>
<p>With dates stored as strings, you cannot compute "days since purchase".</p>

<h3>Transformation: <code>map</code>, <code>apply</code>, <code>applymap</code></h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Function</th><th>Works on</th><th>Example</th></tr>
<tr><td><code>map()</code></td><td>Element-wise on a <strong>Series</strong></td><td><code>df["user_code"] = df["user_type"].map({"New":1, "Returning":2})</code></td></tr>
<tr><td><code>applymap()</code></td><td>Element-wise on a <strong>DataFrame</strong></td><td>Get week number from each date with a lambda</td></tr>
<tr><td><code>apply()</code></td><td>Whole rows/columns along an <strong>axis</strong></td><td>Range (max − min) of every numeric column</td></tr>
</table></div>
<pre><code>df["purchase_month"] = df["date"].dt.month
df["is_weekend"]     = df["date"].dt.dayofweek > 4    # Sat=5, Sun=6</code></pre>

<details class="check"><summary>Check yourself: which pandas call tells you how many non-null values each column has?</summary><div><p><code>df.info()</code>. (<code>df.isnull().sum()</code> gives the missing count directly.)</p></div></details>
`
        },
        {
            id: 'missing', title: 'Missing values & duplicates',
            html: String.raw`
<h3>Why missing values matter</h3>
<div class="cards">
<div class="card"><span class="tag">1 · Algorithm errors</span><p>Most ML algorithms (scikit-learn defaults) <strong>crash</strong> on NaN.</p></div>
<div class="card"><span class="tag">2 · Biased statistics</span><p>Missing data can skew the mean or variance, which leads to wrong assumptions.</p></div>
<div class="card"><span class="tag">3 · Reduced data size</span><p>Blindly deleting every row with a NaN can destroy your dataset.</p></div>
</div>

<h3>Three strategies</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Strategy</th><th>Code</th><th>When to use</th></tr>
<tr><td><strong>Remove</strong></td><td><code>df.dropna()</code></td><td>Large dataset, very few missing (&lt; 1%)</td></tr>
<tr><td><strong>Impute (fill)</strong></td><td><code>df["price"].fillna(mean)</code></td><td>Numeric data: <strong>mean</strong> if roughly normal, <strong>median</strong> if outliers exist</td></tr>
<tr><td><strong>Forward / backward fill</strong></td><td><code>df.ffill()</code> / <code>df.bfill()</code></td><td>Time series where the previous state usually persists. Also proximity-based filling of string columns like <code>user_type</code></td></tr>
</table></div>

<div class="vis" data-vis="impute"></div>

<h3>Duplicates</h3>
<pre><code>df.duplicated().sum()                 # count duplicates
df.duplicated(subset=["serial_no"])   # check on a subset of columns
df.drop_duplicates(inplace=True)      # remove exact duplicates</code></pre>
<p><strong>Why they matter</strong>: duplicates distort counts, pull averages towards repeated values, and cause <strong>data leakage</strong> if a duplicate ends up in both the train and test sets.</p>
<div class="callout trap"><span class="ttl">Rule</span>Don't automatically delete duplicates without checking whether they are <strong>legitimate repeated events</strong>, e.g. two identical coffees bought at 9:00 AM.</div>

<details class="check"><summary>Think-pair-share: prices A=100, B=120, C=NaN, D=110, E=1000. Remove C? Mean or median? Is 1000 an outlier?</summary><div><p>Removing C loses 20% of a tiny dataset, so it's better to impute. Mean = (100+120+110+1000)/4 = <strong>332.5</strong>, which is dragged up by E. Median = (110+120)/2 = <strong>115</strong>. Use the <strong>median</strong>, because 1000 is very likely an outlier (about 9× the others).</p></div></details>
<details class="check"><summary>Check yourself: what's the difference between <code>dropna()</code> and <code>fillna()</code>?</summary><div><p><code>dropna()</code> removes the row (or column) entirely. <code>fillna()</code> replaces the missing value with a substitute such as the mean or median.</p></div></details>
`
        },
        {
            id: 'encode', title: 'Encoding categories & scaling',
            html: String.raw`
<p class="lead">ML algorithms run on mathematics. They need <strong>numbers, not text</strong>. How do we turn categories into numbers without confusing the algorithm?</p>

<div class="vs">
<div><h5>Label encoding</h5><p>Assigns a single integer to each class: Red → 0, Blue → 1, Green → 2.</p><p class="small"><strong>Risk</strong>: the model may assume Green (2) is "greater than" Red (0).</p></div>
<div><h5>One-hot encoding</h5><p>A binary column for each class: Red [1,0,0], Blue [0,1,0], Green [0,0,1].</p><p class="small"><strong>Benefit</strong>: no implied order, so it's best for <strong>nominal</strong> data.</p></div>
</div>
<pre><code>df["user_code"] = df["user_type"].map({"a":1, "b":2, "c":3})   # careful: implies order
pd.get_dummies(df, columns=["user_type"])                        # one-hot (indicator variables)</code></pre>

<h3>Why feature scaling?</h3>
<div class="tbl-wrap"><table class="tbl"><tr><th>Age</th><th>Income</th></tr><tr><td>25</td><td>45,000</td></tr><tr><td>30</td><td>55,000</td></tr></table></div>
<p>Distance-based algorithms (KNN, SVM) compute differences between points. Income (difference 10,000) completely <strong>dominates</strong> age (difference 5) just because its raw numbers are larger. Scaling (normalisation) puts all features on <strong>equal footing</strong>.</p>

<div class="two">
<div class="card"><h5>Min–max scaling</h5><p>Compresses values into [0, 1].</p>$$x' = \frac{x - x_{min}}{x_{max} - x_{min}}$$</div>
<div class="card"><h5>Standardisation (z-score)</h5><p>Centres at mean 0 with standard deviation 1.</p>$$z = \frac{x - \mu}{\sigma}$$</div>
</div>
<p class="small muted">Other options: rescaling, unit scaling, robust scaling (Chapter 4 covers these in depth).</p>

<details class="check"><summary>Check yourself: why might one-hot encoding be required for a "Colour" feature?</summary><div><p>To stop the algorithm assuming a false numeric order (e.g. Red &lt; Blue &lt; Green) that label encoding would introduce.</p></div></details>
<details class="check"><summary>Check yourself: ages 20, 30, 60. Min–max scale 30.</summary><div><p>(30 − 20) / (60 − 20) = 10/40 = <strong>0.25</strong>.</p></div></details>
`
        },
        {
            id: 'summarise', title: 'Text, groupby & visualisation',
            html: String.raw`
<h3>Basic text preprocessing</h3>
<div class="flow arrows"><span>Raw text<small>"The cats are running!"</small></span><span>Tokenisation<small>["The","cats","are","running","!"]</small></span><span>Normalisation<small>["cat","run"]</small></span></div>
<ul>
<li><strong>Tokenisation</strong>: split strings into units (sentences → words, words → characters).</li>
<li><strong>Stopword removal</strong>: drop high-frequency, low-information words (the, is, at, punctuation, conjunctions) to cut dimensionality and noise.</li>
<li><strong>Stemming</strong>: a <em>heuristic</em> that chops words to a root. <strong>Lemmatisation</strong>: uses <em>grammar and vocabulary rules</em> to find the canonical root (running → run).</li>
</ul>

<h3>Summarisation with <code>groupby</code>: split → apply → combine</h3>
<pre><code># 1. Simple grouping
df.groupby("user_type")["price"].mean()

# 2. Multiple aggregations (dict: column -> function(s))
df.groupby("user_type").agg({"price": ["mean", "max"], "quantity": "sum"})</code></pre>
<ol class="steps"><li><strong>Split</strong> the data by category (user_type).</li><li><strong>Apply</strong> a function (mean/sum) to each group.</li><li><strong>Combine</strong> the results into a new table.</li></ol>
<p>Three variants from the lecture: (1) several aggregations on one field, (2) different functions on different fields via a dict to <code>agg()</code>, (3) a mix of both. Other reshapers: <code>pivot()</code>, <code>pivot_table()</code>, <code>stack()</code>, <code>unstack()</code>, <code>crosstab()</code>, <code>melt()</code>.</p>

<h3>Choosing the right visualisation</h3>
<p>"Before training a model, understand your data." Visuals help identify trends, compare groups, spot outliers and discover correlations.</p>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Question / goal</th><th>Chart</th></tr>
<tr><td>Trend over time?</td><td><strong>Line chart</strong></td></tr>
<tr><td>Compare numeric values across categories?</td><td><strong>Bar chart</strong></td></tr>
<tr><td>Distribution of one numeric variable?</td><td><strong>Histogram</strong></td></tr>
<tr><td>Outliers and spread?</td><td><strong>Box plot</strong></td></tr>
<tr><td>Relationship between two numeric variables?</td><td><strong>Scatter plot</strong></td></tr>
<tr><td>Parts of a whole</td><td>Pie chart (use sparingly)</td></tr>
</table></div>

<h3>Putting it together</h3>
<div class="flow arrows"><span>1 Business goal</span><span>2 Collect</span><span>3 Inspect &amp; clean</span><span>4 Handle missing</span><span>5 Encode cats</span><span>6 Scale</span><span>7 Train</span><span>8 Evaluate</span></div>

<details class="check"><summary>Activity: ID 1 (Age 45, Income 60,000, Basic, 01-Jan-25), ID 2 (22, NaN, Premium, 15-Feb-25), ID 1 again (45, 60,000, Basic, 01-Jan-25). Spot the tasks.</summary><div><ul><li><strong>Missing value</strong>: Income for ID 2.</li><li><strong>Duplicate</strong>: ID 1 appears twice with identical values.</li><li><strong>Categorical variable</strong>: Plan_Type (Basic/Premium) needs encoding.</li><li><strong>Wrong data type risk</strong>: Sign_Up "01-Jan-25" is likely loaded as a string, so convert with <code>pd.to_datetime</code>. Income "60,000" with a comma may load as a string too.</li></ul></div></details>
`
        }
    ],
    notes: String.raw`
<h3>1. Why a pipeline?</h3>
<p>The algorithm is only a small part of the work. <strong>CRISP-DM</strong> (Business Understanding → Data Understanding → Data Preparation (heaviest) → Modelling → Evaluation → Deployment) is the project framework: broad, business-focused and team-wide. The <strong>ML pipeline</strong> (Raw data → Preprocessing &amp; wrangling → Feature engineering → Training → Evaluation &amp; tuning → Deployment &amp; monitoring) is the technical workflow: code that executes Data Prep and Modelling.</p>
<p><strong>Preprocessing consistency</strong>: learn scaling parameters and category mappings on training data, then apply the <em>same</em> parameters at inference. Never recalculate on new records. Recalculating using test data is <strong>data leakage</strong> and inflates accuracy.</p>

<h3>2. Data sources & types</h3>
<p>CSV (tabular, best for pandas), JSON (nested key–value, web APIs, needs flattening), XML (tag tree, legacy, verbose; tag/content/element/attribute), HTML and web scraping (crawl → scrape with regex/XPath/tags), SQL (direct queries via sqlalchemy/pyodbc/sqlite3, or an ORM). Types: numeric → scaling; categorical → label/one-hot; text → tokenisation, stopwords, TF-IDF; datetime → extract day/month/duration.</p>

<h3>3. Wrangling</h3>
<p>Inspect with <code>info()</code> (shape, dtypes, non-null counts) and <code>describe()</code> (mean, std, min, max, so you can spot outliers). Checklist: missing values, duplicates, wrong types, outliers. Clean names with <code>rename()</code>. Filter rows with conditions, <code>iloc</code>, <code>drop</code>, <code>head/tail</code>. Select columns by name, position or <code>select_dtypes</code>. Typecast with <code>pd.to_datetime</code> and <code>pd.to_numeric</code>. Transform with <code>map</code> (Series, element-wise), <code>applymap</code> (DataFrame, element-wise) and <code>apply</code> (along an axis). Derive features like <code>dt.month</code> and an is_weekend flag.</p>

<h3>4. Missing values & duplicates</h3>
<p>NaNs crash algorithms, bias statistics, and dropping them shrinks data. Strategies: remove (<code>dropna</code>, when &lt;1% is missing), impute (<code>fillna</code> with the mean for normal data or the median with outliers), and forward/backward fill (time series). Duplicates distort counts and averages and leak between train and test. Use <code>duplicated()</code> and <code>drop_duplicates()</code>, but check first whether they are legitimate repeats.</p>

<h3>5. Encoding & scaling</h3>
<p>Label encoding uses one integer per class, which implies a false order for nominal data. One-hot encoding (<code>get_dummies</code>) uses one binary column per class with no order. Scaling matters for distance-based models (KNN, SVM), because large-magnitude features dominate. Min–max gives [0,1]. The z-score gives mean 0, std 1.</p>

<h3>6. Text, summarisation & visualisation</h3>
<p>Text: tokenise → remove stopwords → stem (heuristic) or lemmatise (grammar rules). <code>groupby</code> = split-apply-combine, with <code>agg</code> taking a dict. Charts: line = trend, bar = compare categories, histogram = distribution, box = outliers/spread, scatter = relationship.</p>
`,
    subjective: [
        { q: 'Differentiate CRISP-DM from the ML pipeline.', m: 4, a: String.raw`<p><strong>CRISP-DM</strong> is the <em>project framework</em>. It has a broad business focus, includes strategy and objectives (business understanding through deployment), and guides the whole team of managers, engineers and analysts.</p><p>The <strong>ML pipeline</strong> is the <em>technical workflow</em>. It is strictly technical (code, scripts, algorithms) and automatically executes the Data Preparation and Modelling phases. It assumes business and data understanding are already covered.</p>` },
        { q: 'Explain the "preprocessing consistency" rule and why violating it causes data leakage.', m: 5, a: String.raw`<p>During <strong>training</strong>, preprocessing <em>learns</em> parameters such as min/max for scaling or category-to-number mappings from the training data only. During <strong>deployment/inference</strong>, new data must go through the <em>same</em> preprocessing with the <em>exact same</em> learned parameters. You never recalculate parameters on new individual records.</p><p>If parameters are recalculated using test data (e.g. computing min/max over train + test), information from the test set leaks into the transformation. The model is then evaluated on data that influenced its preprocessing, which <strong>falsely inflates accuracy</strong>, and the reported performance won't hold on truly unseen data.</p>` },
        { q: 'Describe THREE strategies for handling missing values, with the situation in which each is appropriate.', m: 6, a: String.raw`<ol><li><strong>Remove</strong> (<code>df.dropna()</code>): delete rows with missing values. Appropriate when the dataset is large and very few values are missing (e.g. &lt; 1%), so little information is lost.</li><li><strong>Impute</strong> (<code>df[col].fillna(value)</code>): replace with a central tendency. Use the <em>mean</em> for roughly normally distributed numeric data, and the <em>median</em> when outliers exist, because the median is robust to extreme values.</li><li><strong>Forward/backward fill</strong> (<code>ffill</code>/<code>bfill</code>): copy the previous or next row's value. Appropriate for time-series data where the previous state usually persists, or for proximity-based filling of categorical fields.</li></ol>` },
        { q: 'Compare label encoding and one-hot encoding. Which should be used for a nominal feature such as "Colour", and why?', m: 5, a: String.raw`<p><strong>Label encoding</strong> assigns one integer per class (Red 0, Blue 1, Green 2) and produces a single column. <strong>One-hot encoding</strong> creates one binary column per class (Red [1,0,0], Blue [0,1,0], Green [0,0,1]), with exactly one "hot" value per row.</p><p>For nominal "Colour", use <strong>one-hot</strong>. Label encoding introduces a false magnitude/order, so the model may treat Green (2) as "greater than" Red (0) or average two colours into a third. One-hot has no implied order.</p>` },
        { q: 'Why is feature scaling important? Explain with an Age/Income example and give the formulas of two scaling methods.', m: 6, a: String.raw`<p>Distance-based algorithms like KNN and SVM compute differences between points. With Age (25, 30) and Income (45,000, 55,000), the income difference (10,000) dwarfs the age difference (5), so income alone decides the distance even if age matters more. Scaling puts all features on an equal mathematical footing.</p><p><strong>Min–max</strong>: $x' = (x - x_{min})/(x_{max} - x_{min})$, giving the range [0,1].</p><p><strong>Standardisation (z-score)</strong>: $z = (x-\mu)/\sigma$, giving mean 0 and standard deviation 1.</p>` },
        { q: 'Explain the split-apply-combine process of groupby() and write code computing the mean and max price and total quantity per user_type.', m: 5, a: String.raw`<p><strong>Split</strong>: divide the rows into groups by a key (user_type). <strong>Apply</strong>: compute an aggregation (mean, sum, max…) independently for each group. <strong>Combine</strong>: merge the per-group results into a new summary table.</p><pre><code>df.groupby("user_type").agg({
    "price": ["mean", "max"],
    "quantity": "sum"
})</code></pre>` },
        { q: 'For each analysis goal, choose the most appropriate chart: (a) trend over time, (b) distribution of a single numeric variable, (c) outliers and spread, (d) relationship between two numeric variables, (e) comparing values across categories.', m: 5, a: String.raw`<p>(a) Line chart. (b) Histogram. (c) Box plot. (d) Scatter plot. (e) Bar chart.</p>` }
    ],
    mcq: [
        { q: 'Which CRISP-DM phase focuses on understanding project objectives?', o: ['Data Understanding', 'Business Understanding', 'Evaluation', 'Deployment'], a: 1, e: 'Business Understanding defines the problem, desired outcome and success measures.' },
        { q: 'Which CRISP-DM phase is described as "the heaviest stage"?', o: ['Modelling', 'Evaluation', 'Data Preparation', 'Deployment'], a: 2, e: 'Cleaning, transforming, handling missing values, encoding and scaling take the most effort.' },
        { q: 'During deployment, new data should be preprocessed by:', o: ['Recalculating min and max on the new record', 'Applying the exact parameters learned during training', 'Skipping preprocessing', 'Fitting a new scaler on the test set'], a: 1, e: 'Preprocessing consistency: never recalculate parameters on new records.' },
        { q: 'Data leakage in preprocessing refers to:', o: ['Losing rows when dropping NaNs', 'Using test-set information (e.g. recalculated min/max) to transform data', 'Storing data in JSON', 'Using too many features'], a: 1, e: 'Leakage falsely inflates accuracy because test information influenced training.' },
        { q: 'Which format is a nested key–value structure commonly used by web APIs?', o: ['CSV', 'JSON', 'XML', 'SQL'], a: 1, e: 'JSON maps directly to Python dicts and needs flattening for ML.' },
        { q: 'In XML, key–value pairs inside a start or empty tag are called:', o: ['Elements', 'Content', 'Attributes', 'Tags'], a: 2, e: 'Attributes describe properties of an element.' },
        { q: 'The two steps of a typical web-scraping flow are:', o: ['Crawl and Scrape', 'Fetch and Train', 'Parse and Model', 'Split and Combine'], a: 0, e: 'A crawler fetches pages, then scraping extracts information (regex, XPath, tags).' },
        { q: 'Which pandas function reports column dtypes and non-null counts?', o: ['df.describe()', 'df.info()', 'df.head()', 'df.groupby()'], a: 1, e: 'info() shows shape, dtypes, non-null counts and memory usage. describe() gives statistics.' },
        { q: 'A price column loaded as strings like "USD 150.00" should be converted with:', o: ['pd.to_datetime', 'pd.to_numeric (after stripping the symbol)', 'df.rename', 'pd.get_dummies'], a: 1, e: 'Strip the currency symbol, then convert with to_numeric so maths works.' },
        { q: 'Which function works element-wise on a pandas Series?', o: ['apply()', 'map()', 'groupby()', 'agg()'], a: 1, e: 'map() is element-wise on a Series. applymap() is element-wise on a DataFrame. apply() works along an axis.' },
        { q: 'Prices: 100, 120, NaN, 110, 1000. The best value to impute the NaN is:', o: ['Mean = 332.5', 'Median = 115', '0', 'Drop the column'], a: 1, e: '1000 is an outlier that drags the mean up. The median is robust.' },
        { q: 'Forward fill (ffill) is most appropriate for:', o: ['Nominal categories with no order', 'Time-series data where the previous state persists', 'Removing duplicates', 'Scaling features'], a: 1, e: 'ffill copies the previous row\'s value forward.' },
        { q: 'Duplicates appearing in both train and test sets cause:', o: ['Underfitting', 'Data leakage', 'Feature scaling issues', 'Missing values'], a: 1, e: 'The model is effectively tested on data it trained on.' },
        { q: 'The main risk of label-encoding a nominal feature is:', o: ['Too many columns', 'The model assumes a false numeric order', 'It cannot handle text', 'It removes the reference category'], a: 1, e: 'Green (2) is not "greater than" Red (0), but the model may treat it that way.' },
        { q: 'Why does Income dominate Age in KNN without scaling?', o: ['Income is more important', 'Its raw values are larger in magnitude, so they dominate distance', 'Age is categorical', 'KNN ignores small features'], a: 1, e: 'Distance calculations are driven by magnitude, so scaling equalises the features.' },
        { q: 'Standardisation (z-score) transforms data to have:', o: ['Range [0, 1]', 'Mean 0 and standard deviation 1', 'Median 0 and IQR 1', 'Only positive values'], a: 1, e: 'z = (x − μ)/σ.' },
        { q: 'Which reduces words to root forms using grammar and vocabulary rules?', o: ['Stemming', 'Lemmatisation', 'Tokenisation', 'Stopword removal'], a: 1, e: 'Stemming is heuristic. Lemmatisation uses linguistic rules.' },
        { q: 'Which chart best shows outliers and spread?', o: ['Line chart', 'Pie chart', 'Box plot', 'Bar chart'], a: 2, e: 'Box plots show median, quartiles and outlier points.' },
        { q: 'Which chart best shows the relationship between two numeric variables?', o: ['Histogram', 'Scatter plot', 'Bar chart', 'Pie chart'], a: 1, e: 'Scatter plots reveal correlation and patterns between two numeric features.' },
        { q: 'A limitation of Python mentioned in the lecture is:', o: ['Hard to learn', 'Slower execution than C/C++ due to the virtual machine layer', 'No open-source community', 'Single paradigm only'], a: 1, e: 'Python code is not directly compiled, so it runs slower than C/C++.' }
    ]
});
