<div class="section-row bg-purple-dark" id="hero">
  <div class="container-fluid">
    {% if hero.title %}
      <h1 class="title{{ hero.title_align }}">{{ hero.title }}</h1>
    {% endif %}

    {% if hero.description %}
      <p>{{ hero.description }}</p>
    {% endif %}
  </div>

  <svg viewBox="0 0 1920 60" aria-hidden="true"><path fill="#0b0c2a" d="M-153.5,85.5a4002.033,4002.033,0,0,1,658-71c262.854-6.5,431.675,15.372,600,27,257.356,17.779,624.828,19.31,1089-58v102Z"></path></svg>
</div>