from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Submission, CodingChallenge, ChallengeSolution, UserProfile

class SignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        # Create user profile
        UserProfile.objects.create(user=user)
        return user

class SubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['points', 'last_active']

class UserSerializer(serializers.ModelSerializer):
    points = serializers.SerializerMethodField()
    programs_executed = serializers.SerializerMethodField()
    challenges_completed = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'points', 'programs_executed', 'challenges_completed']

    def get_programs_executed(self, obj):
        return obj.submissions.count()

    def get_points(self, obj):
        try:
            return obj.profile.points
        except UserProfile.DoesNotExist:
            return 0

    def get_challenges_completed(self, obj):
        return obj.solutions.filter(is_correct=True).count()

class CodingChallengeSerializer(serializers.ModelSerializer):
    created_by = serializers.ReadOnlyField(source='created_by.username')
    test_cases = serializers.JSONField(write_only=True)  # Hide test cases from regular users

    class Meta:
        model = CodingChallenge
        fields = ['id', 'title', 'description', 'example_input', 'example_output', 
                'test_cases', 'difficulty', 'created_at', 'created_by', 'is_active']

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        
        # Only show test cases to admins or the challenge creator
        request = self.context.get('request')
        if request and (request.user.is_superuser or request.user == instance.created_by):
            representation['test_cases'] = instance.test_cases
        else:
            representation.pop('test_cases', None)
            
        return representation

class ChallengeSolutionSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    challenge_title = serializers.ReadOnlyField(source='challenge.title')
    
    class Meta:
        model = ChallengeSolution
        fields = ['id', 'username', 'challenge', 'challenge_title', 'code', 
                'language', 'is_correct', 'created_at']
        read_only_fields = ['is_correct']