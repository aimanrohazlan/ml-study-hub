ML.addChapter({
    id: 3,
    title: 'Feature Engineering',
    short: 'Feature Engineering',
    lecture: 'Lectures 3–4',
    color: '#4f46e5',
    blurb: 'Numeric transforms and binning, categorical encodings, text vectors (BoW, TF-IDF, embeddings), temporal and image features.',
    outcomes: [
        'Explain why feature engineering is an iterative necessity',
        'Apply transformations and binning to numeric data',
        'Encode categorical variables without introducing false magnitude',
        'Extract numerical vectors from raw text',
        'Derive structured features from dates and times',
        'Understand how images become numerical matrices'
    ],
    topics: [
        {
            id: 'why', title: 'What & why of feature engineering',
            html: String.raw`
<p class="lead">Can an algorithm learn directly from raw reality? Usually not. <strong>Feature engineering</strong> is the bridge between raw data and modelling: it turns messy, mixed-type data into useful numeric features.</p>
<div class="flow arrows"><span>Raw Data<small>messy, unstructured, mixed types</small></span><span>Feature Engineering<small>transform to useful numbers</small></span><span>ML Model<small>learns patterns, predicts</small></span></div>

<div class="callout key"><span class="ttl">Not a one-time task</span>The CRISP-DM principle: feature engineering is <strong>highly iterative</strong>. After evaluating and tuning, you revisit the feature set to find the best one.</div>

<h3>Vocabulary</h3>
<ul>
<li><strong>Raw data</strong>: data in its native form after retrieval (usually after some wrangling).</li>
<li><strong>Features</strong>: specific representations obtained from raw data after feature engineering.</li>
<li><strong>Underlying problem</strong>: the business use case, converted into an ML task.</li>
<li><strong>Predictive models</strong>: built from the extracted features.</li>
<li><strong>Model accuracy</strong>: performance metrics used to evaluate the model.</li>
<li><strong>Unseen data</strong>: good features should help the model generalise to it.</li>
</ul>

<h3>Why it matters: good features beat complex algorithms</h3>
<div class="cards">
<div class="card"><span class="tag">1 · Better representation</span><p>Exposes hidden patterns that algorithms can't find natively, and is easier to visualise.</p></div>
<div class="card"><span class="tag">2 · Better performance</span><p>Simple models with great features beat complex models with bad features.</p></div>
<div class="card"><span class="tag">3 · Essential for building</span><p>Raw data can't be used directly. Many algorithms strictly require numeric arrays.</p></div>
<div class="card"><span class="tag">4 · Flexibility on data types</span><p>Enables models on text, images and video (unstructured data).</p></div>
<div class="card"><span class="tag">5 · Business &amp; domain</span><p>Injects domain knowledge and business logic. Pure statistics is rarely enough.</p></div>
</div>

<h3>The five data types (lecture roadmap)</h3>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Type</th><th>Examples</th><th>Techniques</th></tr>
<tr><td>Numeric</td><td>Age, income, scores</td><td>Transforms, bins</td></tr>
<tr><td>Categorical</td><td>Country, genre, size</td><td>Encodings</td></tr>
<tr><td>Text</td><td>Reviews, documents</td><td>BoW, TF-IDF, embeddings</td></tr>
<tr><td>Temporal</td><td>Dates, timestamps</td><td>Time extractions</td></tr>
<tr><td>Image</td><td>Photos, scans</td><td>Pixels, CNNs</td></tr>
</table></div>
<p>There are no fixed rules. Feature engineering combines domain knowledge, business constraints, hand-crafted transformations and mathematical transformations.</p>
`
        },
        {
            id: 'numeric', title: 'Numeric features: transforms & binning',
            html: String.raw`
<p class="lead">Raw numeric values (e.g. Pokémon attack/defence) and <strong>counts</strong> (e.g. a song's <code>listen_count</code>) can often be used directly, but they're usually more useful once transformed.</p>

<h3>1. Binarisation: count → presence/absence</h3>
<p>For a recommender we care <em>whether</em> a user listened to a song, not how many times.</p>
<pre><code>from sklearn.preprocessing import Binarizer
bn = Binarizer(threshold=0.9)          # listen_count > 0.9 -> 1 else 0
df["listened"] = bn.transform([df["listen_count"]])[0]</code></pre>

<h3>2. Rounding: remove false precision</h3>
<p>87.638294% → 88%. Use it when decimal variation is sensor noise or a calculation artefact rather than real signal. Excess precision is an overfitting risk.</p>

<h3>3. Interaction / polynomial features</h3>
<p>Combine features to capture synergy. With <code>PolynomialFeatures(degree=2, interaction_only=False, include_bias=False)</code> on Attack and Defense you get <strong>5 features</strong>:</p>
$$\text{Attack},\ \text{Defense},\ \text{Attack}^2,\ \text{Attack}\times\text{Defense},\ \text{Defense}^2$$

<h3>4. Binning (quantisation): continuous → discrete intervals</h3>
<div class="cards">
<div class="card"><span class="tag">Fixed-width</span><p>Bins of equal width, e.g. age decades: <code>floor(age/10)</code> gives 0–9, 10–19, 20–29…</p></div>
<div class="card"><span class="tag">Custom (domain)</span><p>Human logic sets boundaries, e.g. 0–15, 16–30, 31–45, 46–60, 61–75, 75–100.</p></div>
<div class="card"><span class="tag">Adaptive / quantile</span><p>Bins from the data distribution. q-quantiles split into q <strong>equal-count</strong> partitions. 4-quantiles = quartiles.</p></div>
</div>
<div class="callout trap"><span class="ttl">The problem with fixed bins</span>Uneven distributions produce some densely populated bins and some sparse or <strong>empty</strong> ones. Quantile binning fixes this by putting roughly the same number of points in each bin.</div>
<pre><code>quantile_list = [0, .25, .5, .75, 1.]
df["income_q"] = pd.qcut(df["Income"], q=quantile_list, labels=["0-25Q","25-50Q","50-75Q","75-100Q"])</code></pre>

<h3>5–6. Statistical (power) transforms</h3>
<p>Log and Box-Cox belong to the <strong>power transform</strong> family. They create monotonic transformations that <strong>stabilise variance</strong>, make the data more <strong>normal-like</strong>, and reduce dependence on the mean. Their main use is fixing <strong>right skew</strong> (e.g. developer income).</p>
<div class="two">
<div class="card"><h5>Log transform</h5>$$y = \log_b(x)$$<p class="small">Compresses large values. Needs x &gt; 0 (use log(1+x) for zeros).</p></div>
<div class="card"><h5>Box-Cox transform</h5>$$y=\begin{cases}\dfrac{x^{\lambda}-1}{\lambda} & \lambda\ne0\\[4pt] \ln x & \lambda=0\end{cases}$$<p class="small">A generalised family. λ is chosen to make the result most normal. Needs x &gt; 0.</p></div>
</div>
<div class="vis" data-vis="skew"></div>

<div class="tbl-wrap"><table class="tbl">
<tr><th>Technique</th><th>Purpose</th><th>Example</th></tr>
<tr><td>Binarisation</td><td>Count → presence/absence</td><td>listen_count &gt; 0</td></tr>
<tr><td>Interaction</td><td>Capture synergy</td><td>Attack × Defense</td></tr>
<tr><td>Fixed binning</td><td>Continuous → predefined groups</td><td>Age decades</td></tr>
<tr><td>Quantile binning</td><td>Distribution-based equal-count groups</td><td>Income quartiles</td></tr>
<tr><td>Log / Box-Cox</td><td>Reduce right skew</td><td>Extreme salaries</td></tr>
</table></div>

<details class="check"><summary>Check yourself: age 37 under fixed-width decade binning?</summary><div><p>floor(37/10) = <strong>3</strong>, i.e. the 30–39 bin.</p></div></details>
<details class="check"><summary>Check yourself: why choose quantile binning over fixed-width for income?</summary><div><p>Income is heavily right-skewed. Fixed-width bins would leave most people in the first bins and the high bins nearly empty. Quantile bins give each bin about the same count.</p></div></details>
`
        },
        {
            id: 'categorical', title: 'Categorical encodings',
            html: String.raw`
<div class="vs">
<div><h5>Nominal</h5><p>No concept of order, so sorting makes no sense. Examples: movie/game <strong>genre</strong>, weather <strong>season</strong>, <strong>country</strong>.</p></div>
<div><h5>Ordinal</h5><p>Values have a meaningful order. Examples: <strong>clothing size</strong>, <strong>education level</strong>, Pokémon <strong>Generation</strong> (Gen 1 came before Gen 2).</p></div>
</div>

<h3>Step 1: map to numbers</h3>
<ul>
<li><strong>Nominal</strong>: <code>LabelEncoder</code> gives each genre an integer. <code>gle.fit_transform(df["Genre"])</code></li>
<li><strong>Ordinal</strong>: there is <em>no generic function</em>, because each variable has its own ordering logic. Write a custom mapping: <code>{"Gen 1":1, "Gen 2":2, …}</code></li>
</ul>

<h3>Step 2: encode (avoid false magnitude)</h3>
<p>If you feed label-encoded integers directly, the model treats them as raw numbers and <strong>wrongly introduces magnitude</strong>. Hence these schemes:</p>
<div class="tbl-wrap"><table class="tbl">
<tr><th>Method</th><th>Output size</th><th>Main idea</th></tr>
<tr><td>Label encoding</td><td>1 column</td><td>Category → integer (bad for nominal)</td></tr>
<tr><td><strong>One-hot</strong></td><td><strong>m</strong> columns</td><td>One binary feature per category. Only one is "hot" (1) at a time</td></tr>
<tr><td><strong>Dummy coding</strong></td><td><strong>m − 1</strong> columns</td><td>One-hot with one level dropped. The reference category is all <strong>0</strong>s</td></tr>
<tr><td><strong>Effect coding</strong></td><td><strong>m − 1</strong> columns</td><td>Like dummy, but the reference category is all <strong>−1</strong>s</td></tr>
<tr><td><strong>Feature hashing</strong></td><td>Fixed size <strong>k</strong></td><td>A hash function maps categories to k buckets. Good for <strong>high cardinality</strong></td></tr>
</table></div>

<div class="vis" data-vis="encoder"></div>

<pre><code>pd.get_dummies(df["Generation"])                     # one-hot  (m columns)
pd.get_dummies(df["Generation"], drop_first=True)    # dummy    (m-1, first level = all 0s)
pd.get_dummies(df["Generation"]).iloc[:, :-1]        # dummy, dropping the LAST level instead</code></pre>

<h3>Critical: training vs unseen data</h3>
<p>Fit encoders (<code>LabelEncoder</code>, <code>OneHotEncoder</code>) on <strong>training data</strong>, then use <code>.transform()</code> (not <code>fit_transform</code>) on new data so that it gets exactly the same columns and mapping. This prevents data leakage and pipeline crashes from mismatched columns.</p>

<div class="callout tip"><span class="ttl">Memory hook</span>One-hot: <strong>m</strong>. Dummy: <strong>m−1, zeros</strong>. Effect: <strong>m−1, minus ones</strong>. Hashing: <strong>k</strong>, fixed whatever m is.</div>

<details class="check"><summary>Check yourself: a feature has 6 categories. How many columns from one-hot, dummy and effect coding?</summary><div><p>One-hot: 6. Dummy: 5. Effect: 5.</p></div></details>
<details class="check"><summary>Check yourself: a "user_id" column has 2 million unique values. Which encoding?</summary><div><p><strong>Feature hashing</strong>. One-hot would create 2 million columns. Hashing produces a fixed k columns, at the cost of occasional collisions.</p></div></details>
`
        },
        {
            id: 'text', title: 'Text features: BoW, TF-IDF & embeddings',
            html: String.raw`
<p class="lead">Text is hard because it is completely unstructured. We must turn sentences into numeric vectors.</p>
<h3>Preprocessing first</h3>
<p>1 tokenisation and lowercasing · 2 remove special characters · 3 contraction expansion · 4 remove stopwords · 5 correct spellings · 6 stemming · 7 lemmatisation.</p>

<h3>Bag of Words (BoW)</h3>
<p>Each document becomes a vector of size <strong>N</strong> = number of distinct words in the corpus, holding <strong>term frequencies</strong>. It's a "bag" because it ignores word position, syntax and semantics. Code: <code>CountVectorizer(min_df=0., max_df=1.)</code>.</p>

<h3>Bag of n-grams</h3>
<p>An n-gram is a sequence of n contiguous tokens. For "machine learning model":</p>
<div class="tbl-wrap"><table class="tbl"><tr><th>Unigrams</th><td>"machine", "learning", "model"</td></tr><tr><th>Bigrams</th><td>"machine learning", "learning model"</td></tr><tr><th>Trigrams</th><td>"machine learning model"</td></tr></table></div>
<p>N-grams keep local word order and capture negations: "not good" is one bigram, whereas BoW splits it into "not" and "good". Use <code>ngram_range=(2,2)</code>. Up to order 3 is usually enough.</p>

<h3>TF-IDF</h3>
<p>Problem with BoW on big corpora: words frequent across <em>all</em> documents overshadow the others. TF-IDF adds a normalising factor. Words that occur everywhere are <strong>penalised</strong>, and words that distinguish documents get <strong>more weight</strong>. It was developed for ranking search-engine results.</p>
$$\text{tfidf}(t,d) = \text{tf}(t,d)\times \text{idf}(t), \qquad \text{idf}(t)=\log\frac{N}{\text{df}(t)}$$
<p class="small muted">t = term, N = total documents, df(t) = number of documents containing t. scikit-learn's <code>TfidfVectorizer</code> uses a smoothed version, idf = ln((1+N)/(1+df)) + 1, then L2-normalises each vector.</p>
<div class="vis" data-vis="tfidf"></div>

<h3>Document similarity: cosine similarity</h3>
$$\cos\theta = \frac{\mathbf a\cdot\mathbf b}{\lVert\mathbf a\rVert\,\lVert\mathbf b\rVert}$$
<p>Vectors with similar orientation have an angle near 0°, so cos = 1 (very similar). An angle near 90° gives cos = 0 (not similar). Other metrics: BM25, Hellinger-Bhattacharya, Jaccard. Use it in search engines, document clustering and information retrieval. In the lecture, documents 0, 1, 4 were similar (animals) and 2, 3, 5 were similar (weather), and <strong>K-means</strong> recovered these groups without labels.</p>

<h3>Topic modelling: LDA</h3>
<p><strong>Latent Dirichlet Allocation</strong> is a generative probabilistic model. Each document is a <em>mixture of topics</em>, and each topic is a collection of weighted words. Each latent topic has a Dirichlet prior (similar to pLSI). The lecture found two topics, animals and weather.</p>

<h3>Word embeddings: word2vec</h3>
<p>Each word becomes a dense numeric vector <strong>learned from context</strong>. Words used in similar contexts ("king", "queen") get nearby vectors. word2vec is a popular neural-network-based model. Unlike BoW/TF-IDF, embeddings capture <strong>semantic meaning</strong>.</p>

<details class="check"><summary>Check yourself: a word appears in all 6 documents. What is its IDF with idf = log(N/df)?</summary><div><p>log(6/6) = log 1 = <strong>0</strong>. Its TF-IDF is 0 everywhere, because it doesn't help tell documents apart.</p></div></details>
<details class="check"><summary>Check yourself: why can BoW not tell "good, not bad" from "bad, not good"?</summary><div><p>Both contain the same words with the same counts. BoW ignores order. Bigrams ("not bad" vs "not good") would separate them.</p></div></details>
`
        },
        {
            id: 'temporal', title: 'Temporal (date & time) features',
            html: String.raw`
<p class="lead">Temporal attributes (dates, times, timestamps, plus time zones and DST metadata) are central to time-series problems like stock, commodity and weather forecasting. A single timestamp string contains many independent features.</p>

<h3>Date-based features</h3>
<pre><code>ts = pd.to_datetime(df["Time"])
df["Year"] = ts.dt.year;        df["Month"] = ts.dt.month
df["Day"] = ts.dt.day;          df["Quarter"] = ts.dt.quarter
df["DayOfWeek"] = ts.dt.dayofweek;  df["DayName"] = ts.dt.day_name()
df["DayOfYear"] = ts.dt.dayofyear;  df["WeekOfYear"] = ts.dt.isocalendar().week</code></pre>

<h3>Time-based features &amp; binning</h3>
<p>Extract hour, minute, second, microsecond, and the UTC offset/time zone. Then <strong>bin hours</strong> into time-of-day behaviour categories:</p>
<div class="tbl-wrap"><table class="tbl"><tr><th>Hour range</th><th>Bin</th></tr>
<tr><td>0–5</td><td>Late Night</td></tr><tr><td>5–11</td><td>Morning</td></tr><tr><td>11–16</td><td>Afternoon</td></tr><tr><td>16–21</td><td>Evening</td></tr><tr><td>21–23</td><td>Night</td></tr></table></div>

<h3>Time zones and UTC</h3>
<p>The UTC offset shows how far ahead or behind a time is from Coordinated Universal Time. <strong>Convert to UTC first</strong> to normalise global data before deriving other features.</p>

<h3>Epoch and Gregorian ordinal: dates as continuous numbers</h3>
<div class="two">
<div class="card"><h5>Epoch</h5><p>Seconds elapsed since <strong>1 January 1970</strong> (midnight UTC).</p></div>
<div class="card"><h5>Gregorian ordinal</h5><p>Days elapsed, where <strong>1 January of year 1</strong> = 1.</p></div>
</div>
<p>These make date arithmetic easy, e.g. time elapsed since now or since a major event.</p>

<details class="check"><summary>Check yourself: a purchase at 19:30. Which time-of-day bin?</summary><div><p>16–21 gives <strong>Evening</strong>.</p></div></details>
`
        },
        {
            id: 'image', title: 'Image features',
            html: String.raw`
<p class="lead">Core principle: <strong>any image can be represented as a matrix of numeric pixel values.</strong></p>

<h3>RGB images as 3-D arrays</h3>
<p>A colour image has three <strong>channels</strong> (Red, Green, Blue) and is stored as an array of shape <strong>(m, n, c)</strong>: m rows, n columns, and c channels. Use numpy indexing to extract each channel's 2-D matrix, which you can flatten into a 1-D feature vector.</p>

<h3>Grayscale conversion</h3>
<p>Working with three channels is cumbersome. Grayscale keeps the intensity in a single 2-D matrix, a form of dimensionality reduction for images:</p>
$$Y = 0.2125\,R + 0.7154\,G + 0.0721\,B$$
<p>Y ranges from 0 (black, no intensity) to 1 (white, full intensity).</p>

<h3>Feature extraction approaches</h3>
<div class="cards">
<div class="card"><span class="tag">Raw pixels</span><p>Flatten the pixel matrix into a vector.</p></div>
<div class="card"><span class="tag">Intensity histogram</span><p>Bin intensity values and use bin counts as features. The white Labrador image concentrates around 0.6–0.8 (high intensity).</p></div>
<div class="card"><span class="tag">Aggregate statistics</span><p>Per-channel range (max − min), mean, median, variance, skewness, kurtosis.</p></div>
<div class="card"><span class="tag">Edge detection</span><p><strong>Canny</strong> edge detector (John Canny) finds sharp intensity/brightness changes, i.e. areas of interest.</p></div>
<div class="card"><span class="tag">HOG</span><p><strong>Histogram of Oriented Gradients</strong>, used extensively in <strong>object detection</strong>.</p></div>
<div class="card"><span class="tag">SURF</span><p><strong>Speeded Up Robust Features</strong> (Herbert Bay, patented). Localised descriptors around interest points. Dense SURF gave 140 descriptors × 64 values.</p></div>
</div>

<h3>Visual Bag of Words (VBOW)</h3>
<p>Text techniques applied to images: (1) extract SURF descriptors from many images, (2) <strong>cluster</strong> them, so that each cluster becomes a "visual word", (3) count how many of an image's descriptors fall in each cluster. An octopus image with visual words {eyes, tentacles, suckers} becomes the vector <strong>[1, 3, 5]</strong>. A new cat image's VBOW vector was closest to the cat image's vector.</p>

<h3>CNNs: automated feature extraction</h3>
<p>The deep learning paradigm shift: <strong>convolutional neural networks</strong> learn image features automatically instead of us hand-crafting them (see Chapter 8).</p>

<div class="callout key"><span class="ttl">Final takeaways</span>Models need clean maths, not raw reality. <strong>Features beat algorithms.</strong> <strong>Domain knowledge is king</strong>: maths can't invent custom developer age bins, you have to.</div>

<details class="check"><summary>Check yourself: pixel R=1.0, G=1.0, B=1.0. Grayscale Y?</summary><div><p>0.2125 + 0.7154 + 0.0721 = <strong>1.0</strong> (white).</p></div></details>
`
        }
    ],
    notes: String.raw`
<h3>1. Foundations</h3>
<p>Feature engineering turns raw data into features, the representations models learn from. It is <strong>iterative</strong> (CRISP-DM). Why it matters: better representation, better models (good features beat complex algorithms), it's essential because algorithms need numbers, it gives flexibility on unstructured data, and it brings in domain and business knowledge. There are five data types: numeric, categorical, text, temporal and image.</p>

<h3>2. Numeric</h3>
<p>Use raw values or counts directly. <strong>Binarisation</strong>: count → 0/1 (has the user listened?). <strong>Rounding</strong>: drop false precision. <strong>Interactions</strong>: PolynomialFeatures degree 2 on (a, b) gives a, b, a², ab, b². <strong>Binning</strong>: fixed-width (floor(age/10)), custom (domain ranges), quantile/adaptive (equal counts via <code>pd.qcut</code>; fixes empty bins). <strong>Power transforms</strong>: log $y=\log_b x$ and Box-Cox $(x^\lambda-1)/\lambda$ (ln x when λ=0) reduce right skew, stabilise variance and make data more normal.</p>

<h3>3. Categorical</h3>
<p>Nominal (no order: genre, country) vs ordinal (order: size, education, Generation). Map with LabelEncoder (nominal) or a custom dict (ordinal, since there is no generic function). Raw integers introduce false magnitude, so encode: <strong>one-hot</strong> (m columns), <strong>dummy</strong> (m−1, reference = 0s), <strong>effect</strong> (m−1, reference = −1s), <strong>feature hashing</strong> (fixed k buckets, for high cardinality). Fit encoders on training data and only <code>transform</code> new data.</p>

<h3>4. Text</h3>
<p>Preprocess (tokenise/lowercase, remove special characters, expand contractions, remove stopwords, fix spelling, stem/lemmatise). <strong>BoW</strong>: term-frequency vectors of size N (vocabulary), no order. <strong>N-grams</strong>: contiguous word sequences that keep local order ("not good"). <strong>TF-IDF</strong> = tf × log(N/df), which down-weights ubiquitous words. <strong>Cosine similarity</strong> = a·b/(|a||b|): 1 means similar, 0 means unrelated. Use it for similarity and clustering (K-means). <strong>LDA</strong>: documents are mixtures of topics, and topics are weighted word sets (Dirichlet priors). <strong>word2vec</strong>: dense vectors learned from context, where similar words are close (king ≈ queen).</p>

<h3>5. Temporal</h3>
<p>Date parts (year, month, day, quarter, day of week, day name, day/week of year). Time parts (hour, minute, second, UTC offset). Bin hours into time-of-day. Convert to UTC first. Epoch = seconds since 1 Jan 1970. Gregorian ordinal = days since 1 Jan year 1.</p>

<h3>6. Image</h3>
<p>Images are pixel matrices: RGB is (m, n, 3). Grayscale Y = 0.2125R + 0.7154G + 0.0721B, ranging 0–1. Features: raw pixels, intensity histograms, per-channel statistics, Canny edges, HOG (object detection), SURF local descriptors, and Visual Bag of Words (cluster descriptors into visual words, then count them). CNNs extract features automatically.</p>
`,
    subjective: [
        { q: 'Give FIVE reasons why feature engineering is important.', m: 5, a: String.raw`<ol><li><strong>Better representation of data</strong>: features expose patterns algorithms can't find natively and are easier to visualise.</li><li><strong>Better performing models</strong>: with the right features even a simple model performs well, so good features beat complex algorithms.</li><li><strong>Essential for model building and evaluation</strong>: raw data can't be used directly, and you iterate on features while tuning.</li><li><strong>Flexibility on data types</strong>: enables modelling on complex unstructured data such as text, images and video.</li><li><strong>Emphasis on business and domain</strong>: brings in subject-matter knowledge, since pure statistics is rarely enough.</li></ol>` },
        { q: 'Distinguish fixed-width binning from adaptive (quantile) binning. Why is adaptive binning often safer?', m: 5, a: String.raw`<p><strong>Fixed-width binning</strong> uses predefined bins of fixed width, set by the analyst from rules or business logic (e.g. age decades via floor(age/10)).</p><p><strong>Adaptive/quantile binning</strong> uses the data distribution to decide the bins. q-quantiles split the values into q partitions with roughly equal counts (e.g. quartiles with <code>pd.qcut</code>).</p><p>Adaptive binning is safer because fixed widths on uneven or skewed distributions produce irregular bins. Some are densely populated and others sparse or even empty. Quantile bins are populated uniformly.</p>` },
        { q: 'Explain one-hot encoding, dummy coding and effect coding for a feature with m categories. Illustrate with Generation = {Gen 1, Gen 2, Gen 3}.', m: 6, a: String.raw`<p><strong>One-hot</strong>: m binary features, exactly one of which is 1. Gen 1 → [1,0,0], Gen 2 → [0,1,0], Gen 3 → [0,0,1].</p><p><strong>Dummy coding</strong>: m−1 features. One level (the reference) is dropped and represented by all 0s. Dropping Gen 1 gives Gen 1 → [0,0], Gen 2 → [1,0], Gen 3 → [0,1].</p><p><strong>Effect coding</strong>: like dummy coding, but the reference category is all −1s. Gen 1 → [−1,−1], Gen 2 → [1,0], Gen 3 → [0,1].</p><p>All three avoid the false magnitude that plain label encoding introduces.</p>` },
        { q: 'Explain the limitation of the Bag of Words model and how TF-IDF addresses it. State the TF-IDF formula.', m: 6, a: String.raw`<p>BoW represents each document by absolute term frequencies. In a large corpus, words that occur frequently across <em>all</em> documents get large values and overshadow rarer, more informative terms. BoW also ignores order and semantics.</p><p><strong>TF-IDF</strong> multiplies term frequency by inverse document frequency: $\text{tfidf}(t,d)=\text{tf}(t,d)\times\log\frac{N}{\text{df}(t)}$, where N is the number of documents and df(t) is the number containing t. Words appearing in almost every document get an IDF near 0 and are penalised. Words that distinguish documents get higher weight. This gives a scaled, normalised representation that works better for search ranking and similarity.</p>` },
        { q: 'What is cosine similarity and how is it used for document clustering?', m: 5, a: String.raw`<p>Cosine similarity measures the angle between two feature vectors (e.g. TF-IDF): $\cos\theta = \frac{a\cdot b}{\|a\|\|b\|}$. Similar orientation gives an angle near 0° and cosine near 1 (similar documents). An angle near 90° gives cosine near 0 (dissimilar).</p><p>For clustering, compute pairwise similarities or TF-IDF features for all documents and apply an unsupervised algorithm such as K-means. In the lecture, documents 0, 1, 4 (animals) and 2, 3, 5 (weather) formed two groups without any labels.</p>` },
        { q: 'Describe how a colour image is represented numerically and explain TWO feature extraction techniques for images.', m: 6, a: String.raw`<p>A colour image is a 3-D array (m, n, c): m rows, n columns and c = 3 channels (R, G, B), each a 2-D matrix of pixel intensities. It can be converted to grayscale with Y = 0.2125R + 0.7154G + 0.0721B, giving one 2-D matrix that can be flattened into a vector.</p><p><strong>Intensity histogram binning</strong>: bin the pixel intensities (0–1) into a histogram and use the bin frequencies as features. A white dog image concentrates in high-intensity bins.</p><p><strong>Edge detection (Canny)</strong>: detects sharp intensity/brightness changes to find edges and areas of interest, which can be used as features. (Other valid answers: aggregate statistics, HOG, SURF, VBOW, CNN features.)</p>` },
        { q: 'Describe the Visual Bag of Words (VBOW) model.', m: 4, a: String.raw`<p>VBOW applies the text bag-of-words idea to images. (1) Extract local descriptors (e.g. dense SURF, 140 descriptors × 64 values) from many images. (2) Cluster all descriptors with an unsupervised algorithm, so that each cluster is a "visual word" (e.g. eyes, tentacles, suckers). (3) Assign each of an image's descriptors to its nearest visual word and count them, giving a 1-D vector such as [1, 3, 5]. New images are transformed the same way and compared with distance/similarity metrics.</p>` }
    ],
    mcq: [
        { q: 'Feature engineering is described in CRISP-DM terms as:', o: ['A one-time task done before modelling', 'Highly iterative', 'Only needed for images', 'Part of deployment'], a: 1, e: 'You revisit the feature set after evaluation and tuning.' },
        { q: 'Converting song listen_count into "listened: 1 / not listened: 0" is:', o: ['Rounding', 'Binarisation', 'Binning', 'Log transform'], a: 1, e: 'Binarisation turns counts into presence/absence.' },
        { q: 'PolynomialFeatures(degree=2) on features a and b (no bias) produces how many features?', o: ['3', '4', '5', '6'], a: 2, e: 'a, b, a², ab, b², which is 5.' },
        { q: 'Binning ages using floor(age/10) is an example of:', o: ['Quantile binning', 'Fixed-width binning', 'Feature hashing', 'Box-Cox'], a: 1, e: 'Bins of equal width (decades).' },
        { q: 'The main problem with fixed-width binning on skewed data is:', o: ['It is too slow', 'Some bins become very dense and others sparse or empty', 'It creates negative values', 'It needs labels'], a: 1, e: 'Quantile binning fixes this with equal-count bins.' },
        { q: 'Log and Box-Cox transforms are mainly used to:', o: ['Encode categories', 'Reduce right skew and stabilise variance', 'Create interaction terms', 'Detect edges'], a: 1, e: 'They belong to the power transform family and make data more normal-like.' },
        { q: 'Which is an ordinal categorical variable?', o: ['Country', 'Movie genre', 'Clothing size', 'Weather season'], a: 2, e: 'Sizes have a meaningful order (S < M < L). The others are nominal.' },
        { q: 'Why is there no generic function to transform ordinal features?', o: ['Ordinal features are numeric already', 'Each ordinal variable has its own specific ordering logic', 'scikit-learn does not support them', 'They must be one-hot encoded'], a: 1, e: 'You write a custom mapping dict, e.g. Gen 1 → 1, Gen 2 → 2.' },
        { q: 'For a feature with m categories, dummy coding produces:', o: ['m columns', 'm − 1 columns with the reference as all 0s', 'm − 1 columns with the reference as all −1s', 'A fixed k columns'], a: 1, e: 'Effect coding uses −1s for the reference. One-hot uses m columns.' },
        { q: 'Effect coding differs from dummy coding because:', o: ['It uses m + 1 columns', 'The reference category is represented by −1s instead of 0s', 'It is only for ordinal data', 'It uses hashing'], a: 1, e: 'Otherwise it is the same as dummy coding.' },
        { q: 'Which encoding is best for a high-cardinality nominal feature (e.g. millions of IDs)?', o: ['One-hot encoding', 'Label encoding', 'Feature hashing', 'Effect coding'], a: 2, e: 'Hashing maps to a fixed number of buckets, k.' },
        { q: 'When encoding new (unseen) data, you should:', o: ['fit_transform a new encoder on it', 'Use transform() with the encoder fitted on training data', 'Skip encoding', 'Use label encoding instead'], a: 1, e: 'This keeps the mapping and columns consistent and avoids leakage and crashes.' },
        { q: 'Why is it called "Bag" of Words?', o: ['It stores words in a database', 'It ignores word order, syntax and semantics', 'It only counts stopwords', 'It uses neural networks'], a: 1, e: 'Only term frequencies are kept.' },
        { q: 'Which captures negation like "not good" as a single feature?', o: ['Unigram BoW', 'Bigrams (n-grams)', 'Stopword removal', 'Stemming'], a: 1, e: 'Bigrams keep contiguous pairs of words.' },
        { q: 'In TF-IDF, a term appearing in every document gets:', o: ['Very high weight', 'IDF = log(N/N) = 0, so low weight', 'Weight equal to its frequency', 'A negative weight'], a: 1, e: 'Ubiquitous words are penalised.' },
        { q: 'Cosine similarity of 1 between two document vectors means:', o: ['They are at 90°', 'They have the same orientation (very similar)', 'They share no words', 'They are of different lengths'], a: 1, e: 'cos 0° = 1.' },
        { q: 'LDA (Latent Dirichlet Allocation) is used for:', o: ['Image edge detection', 'Topic modelling', 'Feature scaling', 'Classification of labelled data'], a: 1, e: 'Each document is a mixture of topics, and each topic is a weighted set of words.' },
        { q: 'word2vec embeddings place "king" and "queen" close together because:', o: ['They have similar spelling', 'They are used in similar contexts', 'They are both nouns', 'They have the same TF-IDF'], a: 1, e: 'The vectors are learned from context.' },
        { q: 'The Epoch representation of a timestamp is:', o: ['Days since 1 January year 1', 'Seconds since 1 January 1970 (UTC)', 'Hours since midnight', 'Weeks since the start of the year'], a: 1, e: 'The Gregorian ordinal counts days from 1 January year 1.' },
        { q: 'A colour image of 64 × 64 pixels is stored as an array of shape:', o: ['(64, 64)', '(64, 64, 3)', '(3, 64)', '(4096,)'], a: 1, e: '(m, n, c) with three RGB channels.' },
        { q: 'In the grayscale formula Y = 0.2125R + 0.7154G + 0.0721B, which channel contributes most?', o: ['Red', 'Green', 'Blue', 'All equally'], a: 1, e: 'Green has weight 0.7154.' },
        { q: 'HOG (Histogram of Oriented Gradients) is extensively used for:', o: ['Text classification', 'Object detection', 'Time-zone conversion', 'Topic modelling'], a: 1, e: 'It is a classical computer-vision feature.' },
        { q: 'In VBOW, the "visual words" are obtained by:', o: ['Manually labelling images', 'Clustering local feature descriptors (e.g. SURF)', 'Converting to grayscale', 'Applying TF-IDF to filenames'], a: 1, e: 'Each cluster of similar descriptors is a visual word.' }
    ]
});
