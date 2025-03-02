from django.db import models
from django.contrib.auth.models import User

class Submission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    language = models.CharField(max_length=20)
    code = models.TextField()
    stdin = models.TextField(blank=True, null=True)
    stdout = models.TextField(blank=True, null=True)
    stderr = models.TextField(blank=True, null=True)
    returncode = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.user.username} at {self.created_at}"

class CodingChallenge(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    example_input = models.TextField(blank=True)
    example_output = models.TextField(blank=True)
    test_cases = models.JSONField(default=list)  # List of input/output test cases
    difficulty = models.CharField(max_length=20, choices=[
        ('easy', 'Easy'),
        ('medium', 'Medium'),
        ('hard', 'Hard')
    ], default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='challenges_created')
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

class ChallengeSolution(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='solutions')
    challenge = models.ForeignKey(CodingChallenge, on_delete=models.CASCADE, related_name='solutions')
    code = models.TextField()
    language = models.CharField(max_length=20)
    is_correct = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        # Ensure a user can only have one correct solution per challenge
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'challenge', 'is_correct'],
                condition=models.Q(is_correct=True),
                name='unique_correct_solution'
            )
        ]

    def __str__(self):
        return f"Solution by {self.user.username} for {self.challenge.title}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    points = models.IntegerField(default=0)
    last_active = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.username}"